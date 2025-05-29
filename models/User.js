const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default: "../uploads/empty-profile.jpg",
    },
    role: {
      type: String,
      enum: ["personal", "business", "admin", "user"],
      default: "personal",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
