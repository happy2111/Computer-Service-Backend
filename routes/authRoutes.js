const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { register, login, logout} = require("../controllers/authController");
const { generateAccessToken } = require("../utils/token");
const User = require("../models/User");

function checkTelegramAuth(data) {
  const { hash, ...rest } = data;
  const checkString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(process.env.BOT_TOKEN)
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

    // Telegram добавляет всё после #
    const match = redirectUrl.match(/#tgAuthResult=(.+)/);
    if (!match) {
      return res.status(400).json({ message: "No tgAuthResult found" });
    }

    const raw = decodeURIComponent(match[1]);
    const userData = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));

    console.log("📦 Parsed Telegram userData:", userData);

    if (!checkTelegramAuth(userData)) {
      console.warn("❌ Invalid Telegram signature");
      return res.status(403).json({ message: "Invalid Telegram signature" });
    }

    // ✅ Создаём или обновляем пользователя
    // let user = await User.findOne({ telegram_id: userData.id });
    // if (!user) {
    //   user = await User.create({
    //     telegram_id: userData.id,
    //     first_name: userData.first_name,
    //     username: userData.username,
    //     photo_url: userData.photo_url,
    //   });
    //   console.log("👤 Created new user:", user._id);
    // } else {
    //   console.log("🔁 Existing user found:", user._id);
    // }

    // ✅ Генерируем JWT токен
    // const token = generateAccessToken({ _id: user._id, role: user.role });
    console.log("🎟️ Generated JWT:", userData);

    return res.json({ token, user });
  } catch (err) {
    console.error("🔥 Telegram validate error:", err);
    res.status(400).json({ message: "Invalid Telegram data", error: err.message });
  }
});
router.post("/register", register);

router.post("/login", login);
router.post("/logout", logout)

// Обновление access токена
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



