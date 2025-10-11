const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validation");
const CustomError = require("../utils/CustomError");
const { createCustomer } = require("../services/bitoService");

const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const login = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return next(new CustomError(error.details[0].message, 400));

  const { login, password } = req.body;

  try {
    // Ищем пользователя по email или телефону
    const user = await User.findOne({
      $or: [{ email: login }, { phone: login }]
    }).select("+password");

    if (!user) return next(new CustomError("Foydalanuvchi topilmadi", 400));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new CustomError("Parol noto‘g‘ri", 400));

    // Генерация токенов
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Ответ
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
          avatar: user.avatar || null,
          isStore: user.isStore,
          gender: user.gender,
          bitoCustomerId: user.bitoCustomerId || "" // 🔹 всегда возвращаем, даже если пусто
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
  let bitoCustomerId = "";
  const { name, email, phone, password, role, gender, isStore} = dataToValidate;
  try {
    console.log("📌 Проверяем email и phone в базе...");
    const existing = await User.findOne({ email });
    const existingPhone = await User.findOne({ phone });
    if (existing) return next(new CustomError("Email allaqachon mavjud", 400));
    if (existingPhone) return next(new CustomError("Telefon raqam allaqachon mavjud", 400));
    if (isStore && !gender) {
      throw new Error("Для магазинов поле gender обязательно!");
    }
    console.log("🔑 Хэшируем пароль...");
    const hashedPassword = await bcrypt.hash(password, 10);
    if (isStore) {
      console.log("🌐 Создаём кастомера в Bito...");
      const bitoCustomer = await createCustomer({ name, gender, phone_number: phone });
      bitoCustomerId = bitoCustomer?.data?._id; // сохраняем id
      console.log("🆔 Bito Customer ID:", bitoCustomerId);
    }


    console.log("📝 Создаём пользователя в MongoDB...");
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      isStore,          // 🔹 сохраняем
      gender,           // 🔹 сохраняем
      bitoCustomerId,   // 🔹 сохраняем
    });
    console.log("✅ Пользователь создан:", user._id.toString());


    console.log("🎟️ Генерируем токены...");
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log("🍪 Отправляем ответ клиенту...");
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
          avatar: user.avatar || null, // ✅ Добавлено
          isStore: user.isStore,
          gender: user.gender,
          bitoCustomerId: bitoCustomerId
        },
      });

    console.log("✅ Регистрация завершена успешно!");
  } catch (err) {
    console.error("🔥 Ошибка в процессе регистрации:", err.message);
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Выход выполнен успешно" });
};

module.exports = { register, login ,logout};
