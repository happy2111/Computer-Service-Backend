const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default:
        "https://img.freepik.com/premium-vector/man-empty-avatar-casual-business-style-vector-photo-placeholder-social-networks-resumes_885953-434.jpg",
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
