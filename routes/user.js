const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const updates = {};

      if (name) updates.name = name;
      if (req.file) {
        const avatarUrl = `/uploads/${req.file.filename}`;
        updates.avatar = avatarUrl;
      }

      const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        select: "-password",
      });

      if (!updatedUser)
        return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });

      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  }
);

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

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });
      }
      res.json({ msg: "Foydalanuvchi o‘chirildi" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
