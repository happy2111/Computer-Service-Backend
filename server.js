const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { router: pushNotificationsRouter } = require('./routes/pushNotifications');
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin:  ['http://localhost:5173',"http://192.168.1.148:5173","https://servicehy.netlify.app", "https://www.applepark.uz", "https://applepark.uz"],
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Создаём папку uploads, если её нет
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}



// Роуты API
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/user"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/services", require("./routes/services"));
app.use("/uploads", express.static("uploads"));
app.use("/api/dashboard", require("./routes/dash"));
app.use('/api/push', pushNotificationsRouter);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use("/api/masters", require("./routes/masters"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server работает на порту \n\thttp://localhost:${PORT}`);
});
