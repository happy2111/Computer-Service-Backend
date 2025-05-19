const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/authorizeRoles");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

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

app.use("/api/user", require("./routes/user"));

app.use("/api/contact", require("./routes/contact"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda ishga tushdi`));
