const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const upload = require("../middleware/upload");

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
  // authorizeRoles("admin"),
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

router.post(
  "/create-client",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const { name, surname, phone } = req.body;
      if (!name || !surname || !phone) {
        return res
          .status(400)
          .json({ msg: "Имя, фамилия и телефон обязательны" });
      }
      const email = phone + "@applepark.uz";
      const password = phone;
      const existing = await User.findOne({ phone });
      if (existing) {
        return res
          .status(400)
          .json({ msg: "Пользователь с таким телефоном уже существует" });
      }
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: name + " " + surname,
        email,
        phone,
        password: hashedPassword,
        role: "client",
      });
      res.status(201).json({ msg: "Клиент создан", user });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
