const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { register, login, logout} = require("../controllers/authController");
const { generateAccessToken } = require("../utils/token");
const User = require("../models/User");
const crypto = require("crypto");
const { normalizePhone } = require("../utils/phone");


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

    const fallbackName =
      userData.first_name || userData.username || `tg_${userData.id}`;
    const fallbackEmail = `tg_${userData.id}@applepark.uz`;

    // Создаём/обновляем пользователя
    let user = await User.findOne({ telegram_id: userData.id });
    let isNewUser = false;
    if (!user) {
      const randomPassword = require("crypto").randomBytes(32).toString("hex");

      user = await User.create({
        telegram_id: String(userData.id),

        // обязательные поля вашей схемы:
        name: fallbackName,
        email: fallbackEmail,
        password: randomPassword,

        // дополнительные (если нужны):
        avatar: userData.photo_url || undefined,
        role: "user",
      });
      console.log("👤 Created new user:", user._id);
      isNewUser = true;
    } else {
      // Можно обновить аватар/имя
      const updates = {
        name: fallbackName,
        email: fallbackEmail,
        avatar: userData.photo_url || undefined,
      };
      await User.updateOne({ _id: user._id }, updates);
      console.log("🔁 Existing user updated:", user._id);
    }

    const token = generateAccessToken({ _id: user._id, role: user.role });
    console.log("🎟️ Generated JWT for:", user._id);

    return res.json({
      token,
      isNewUser,
      user: {
        id: String(user._id),
        telegram_id: user.telegram_id,
        email: user.email,
        name: user.name,
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

router.post('/telegram/phone-save', async (req, res) => {
  try {
    // ожидаем телеграмный контекст (из сессии / токена)
    const { userId, telegram_id, phone: rawPhone } = req.body;
    if (!rawPhone) return res.status(400).json({ message: 'Phone required' });

    // normalize and validate
    let phone;
    try {
      phone = normalizePhone(rawPhone);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid phone format' });
    }

    // Проверка уникальности — atomic: искать и обновить
    const existing = await User.findOne({ phone });
    // Если номер уже прикреплён к другому аккаунту — отказ
    if (existing && (!userId || existing._id.toString() !== userId)) {
      return res.status(409).json({ message: 'Этот номер уже используется' });
    }

    // Найти текущего пользователя
    let user;
    if (userId) user = await User.findById(userId);
    else if (telegram_id) user = await User.findOne({ telegram_id });
    else return res.status(400).json({ message: 'userId or telegram_id required' });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Сохраняем номер, помечаем как не верифицированный
    user.phone = phone;
    user.phone_verified = false;
    user.phone_verified_at = null;
    await user.save();

    // Возвращаем обновлённый профиль (без чувствительных полей)
    res.json({
      success: true,
      user: {
        id: user._id,
        telegram_id: user.telegram_id,
        phone: user.phone,
        phone_verified: user.phone_verified,
      },
    });
  } catch (err) {
    console.error('Phone save error:', err);
    res.status(500).json({ message: 'Server error' });
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



