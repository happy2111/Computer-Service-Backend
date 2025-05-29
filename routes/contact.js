const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const validator = require("validator");

router.post("/", async (req, res, next) => {
  try {
    const { name, email, message, captcha } = req.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
    const response = await fetch(verificationUrl, {method: "POST"});
    const data = await response.json();
    if (!data.success) {
      return res.status(400).json({ msg: "Captcha noto‘g‘ri" });
    }

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ msg: "Barcha maydonlar to‘ldirilishi shart" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: "Email noto‘g‘ri kiritilgan" });
    }

    const contact = new Contact({ name, email, message , captcha });
    await contact.save();

    res.status(201).json({ msg: "Xabar yuborildi" });
  } catch (err) {
    next(err);
  }
});

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
