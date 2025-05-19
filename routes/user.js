const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

// Получить профиль авторизованного пользователя
router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Обновить профиль (например, имя)
router.put("/profile", authMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: "Ism kiritilishi shart" });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, select: "-password" }
    );
    if (!updatedUser)
      return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// Пример: получить всех пользователей (только для админа)
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const users = await User.find().select("-password"); // не отдаём пароль
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
);

// Пример: получить текущего залогиненного пользователя
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
