const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validation");
const CustomError = require("../utils/CustomError");

const register = async (req, res, next) => {
  // Удаляем confirmPassword перед валидацией
  const { confirmPassword, ...dataToValidate } = req.body;
  const { error } = registerSchema.validate(dataToValidate);
  if (error) return next(new CustomError(error.details[0].message, 400)); // передаем ошибку в next

  const { name, email, password, role } = dataToValidate;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new CustomError("Email allaqachon mavjud", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  // <-- добавил next
  const { error } = loginSchema.validate(req.body);
  if (error) return next(new CustomError(error.details[0].message, 400));

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return next(new CustomError("Foydalanuvchi topilmadi", 400));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new CustomError("Parol noto‘g‘ri", 400));

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};


module.exports = { register, login };
