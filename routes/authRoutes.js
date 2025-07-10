const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { register, login } = require("../controllers/authController");
const { generateAccessToken } = require("../utils/token");
const User = require("../models/User");

// Регистрация и логин
router.post("/register", register);
router.post("/login", login);

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



