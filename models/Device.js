const mongoose = require("mongoose");
const DeviceSchema = new mongoose.Schema({
  deviceType: { type: String, required: true },
  deviceModel: { type: String, required: true },
  issueDescription: { type: String, required: true },
  phone: { type: String, required: true },
  additionalInfo: { type: String },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "unrepairable"],
    default: "pending",
  },
  imei : { type: String , default: undefined },
  cost : { type: Number },
  costOr : { type: Number },
  master : {type: String},
  statusComment: { type: String, default: "" },
  packedUp: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = DeviceSchema;
