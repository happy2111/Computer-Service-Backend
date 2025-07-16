const mongoose = require("mongoose");

const masterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "/public/empty-profile.jpg",
  },
});

module.exports = mongoose.model("Masters", masterSchema);
