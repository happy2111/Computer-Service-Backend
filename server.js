const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { createAgent } = require("forest-express-mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const Contact = require("./models/Contact");

const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/authorizeRoles");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors())
app.use(cors({
  origin:  ['http://localhost:5173',"https://servicehy.netlify.app"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Создаём папку uploads, если её нет
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Forest Admin
/*const agent = createAgent({
  authSecret: process.env.FOREST_AUTH_SECRET,
  envSecret: process.env.FOREST_ENV_SECRET,
  isProduction: process.env.NODE_ENV === "production",
  mongoose,
});
app.use(agent);*/

// Роуты API
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/user"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/services", require("./routes/services"));
app.use("/uploads", express.static("uploads"));
app.use("/api/dashboard", require("./routes/dash"));

// Пример защищённого маршрута для пользователей с ролью 'user'
app.get(
  "/api/protected",
  authMiddleware,
  authorizeRoles("user"),
  (req, res) => {
    res.json({
      msg: `Привет, пользователь с id: ${req.user.id} role: ${req.user.role}`,
    });
  }
);

// Обработчик ошибок
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server работает на порту \n\thttp://localhost:${PORT}`);
});
