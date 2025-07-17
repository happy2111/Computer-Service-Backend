const mongoose = require("mongoose");
const DeviceSchema = require("./Device")
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true ,select: false},
    avatar: {
      type: String,
      default: "/public/empty-profile.jpg",
    },
    role: {
      type: String,
      enum: ["personal", "master", "admin", "user", "client"],
      default: "personal",
    },
    phone: { type: String },
    device: {
      type: [DeviceSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
