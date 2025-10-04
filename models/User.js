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
    description: { type: String, default: "" },
    position: { type: String, default: "" },
    role: {
      type: String,
      enum: ["personal", "master", "admin", "user", "client"],
      default: "personal",
    },
    phone: { type: String },
    device: {
      type: [DeviceSchema],
      default: []
    },
    isStore: { type: Boolean, default: false },
    bitoCustomerId: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other" },
  },
  { timestamps: true }
);



module.exports = mongoose.model("User", userSchema);
