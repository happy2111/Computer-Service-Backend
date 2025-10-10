const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { register, login, logout} = require("../controllers/authController");
const { generateAccessToken } = require("../utils/token");
const User = require("../models/User");
const crypto = require("crypto");


function checkTelegramAuth(data) {
  const { hash, ...rest } = data;

  // Удаляем неиспользуемые/пустые поля, чтобы не ломать checkString
  const filtered = Object.fromEntries(
    Object.entries(rest).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
  const checkString = Object.keys(filtered)
    .sort()
    .map((k) => `${k}=${filtered[k]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(process.env.BOT_TOKEN || "")
    .digest();

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return hmac === hash;
}

router.get("/telegram/callback", (req, res) => {
  console.log("📩 Telegram redirect received!");
  res.send(`
    <h3>✅ Telegram auth received. You can close this window.</h3>
    <script>setTimeout(() => window.close(), 1500)</script>
  `);
});

router.post("/telegram/validate", async (req, res) => {
  try {
    const { redirectUrl } = req.body;
    console.log("🕵️ Received redirectUrl:", redirectUrl);

    const match = redirectUrl?.match(/#tgAuthResult=([^#]+)/);
    if (!match) {
      return res.status(400).json({ message: "No tgAuthResult found" });
    }

    const raw = decodeURIComponent(match[1]);
    const userData = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));

    console.log("📦 Parsed Telegram userData:", userData);

    if (!process.env.BOT_TOKEN) {
      console.error("⚠️ BOT_TOKEN is not set");
      return res.status(500).json({ message: "Server misconfigured" });
    }
    if (!checkTelegramAuth(userData)) {
      console.warn("❌ Invalid Telegram signature");
      return res.status(403).json({ message: "Invalid Telegram signature" });
    }

    // Создаём/обновляем пользователя
    let user = await User.findOne({ telegram_id: userData.id });
    if (!user) {
      user = await User.create({
        telegram_id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username || null,
        photo_url: userData.photo_url || null,
        role: "user",
      });
      console.log("👤 Created new user:", user._id);
    } else {
      // Можно обновить аватар/имя
      const updates = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username || user.username,
        photo_url: userData.photo_url || user.photo_url,
      };
      await User.updateOne({ _id: user._id }, updates);
      console.log("🔁 Existing user updated:", user._id);
    }

    const token = generateAccessToken({ _id: user._id, role: user.role });
    console.log("🎟️ Generated JWT for:", user._id);

    return res.json({
      token,
      user: {
        id: String(user._id),
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.photo_url,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔥 Telegram validate error:", err);
    res
      .status(400)
      .json({ message: "Invalid Telegram data", error: err?.message || String(err) });
  }
});

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout)

router.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ msg: "Refresh token yo‘q" });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET);

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });

    const accessToken = generateAccessToken({ _id: user._id, role: user.role });

    res.json({ token: accessToken });
  } catch (err) {
    console.log("Refresh error:", err); // Для отладки, можно потом удалить
    return res.status(403).json({ msg: "Refresh token yaroqsiz" });
  }
});


module.exports = router;



