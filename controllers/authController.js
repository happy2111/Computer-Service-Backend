const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validation");
const CustomError = require("../utils/CustomError");

const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const login = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return next(new CustomError(error.details[0].message, 400));

  const { login, password } = req.body;

  try {
    // Ищем пользователя по email или телефону
    const user = await User.findOne({
      $or: [{ email: login }, { phone: login }]
    });

    if (!user) return next(new CustomError("Foydalanuvchi topilmadi", 400));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new CustomError("Parol noto‘g‘ri", 400));

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 kun
      })
      .json({
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
};


const register = async (req, res, next) => {
  const { confirmPassword, ...dataToValidate } = req.body;
  const { error } = registerSchema.validate(dataToValidate);
  if (error) return next(new CustomError(error.details[0].message, 400));

  const { name, email, phone, password, role } = dataToValidate;
  try {
    const existing = await User.findOne({ email });
    const existingPhone = await User.findOne({ phone });
    if (existing) return next(new CustomError("Email allaqachon mavjud", 400));
    if (existingPhone) return next(new CustomError("Telefon raqam allaqachon mavjud", 400));

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashedPassword, role });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
};


module.exports = { register, login };
