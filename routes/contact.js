const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const validator = require("validator");

router.post("/", async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ msg: "Barcha maydonlar to‘ldirilishi shart" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: "Email noto‘g‘ri kiritilgan" });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    res.status(201).json({ msg: "Xabar yuborildi" });
  } catch (err) {
    next(err);
  }
});

// Получить все сообщения (только админ)
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const messages = await Contact.find().sort({ createdAt: -1 });
      res.json(messages);
    } catch (err) {
      next(err);
    }
  }
);

// Удалить сообщение по ID (только админ)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const deleted = await Contact.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ msg: "Xabar topilmadi" });
      res.json({ msg: "Xabar o‘chirildi" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
