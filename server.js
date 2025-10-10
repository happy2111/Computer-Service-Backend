const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { router: pushNotificationsRouter } = require('./routes/pushNotifications');
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const User = require("./models/User");
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors({
    origin: [
      'https://applepark.uz',
      'https://www.applepark.uz',
      'https://servicehy.netlify.app',
    ],
    credentials: true,
  }));
}


app.use(express.json());

// Создаём папку uploads, если её нет
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}



// Роуты API
const cookieParser = require("cookie-parser");
const axios = require("axios");
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
app.use("/api/cart", require("./routes/cartRoutes"));

app.get("/api/health", async (req, res) => {
  try {
    await User.updateMany({}, { $set: { telegram_id: null } });
    res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", async () => {
  try {
    const { data: publicIP } = await axios.get("https://api.ipify.org?format=json");
    console.log(`🚀 Server работает на:
      Локально:  http://localhost:${PORT}
      LAN:       http://192.168.1.148:${PORT}
      Публичный: http://${publicIP.ip}:${PORT}`);
  } catch (err) {
    console.log(`🚀 Server работает на:
      Локально:  http://localhost:${PORT}
      LAN:       http://192.168.1.148:${PORT}
      Публичный: [не удалось определить]`);
  }
});
