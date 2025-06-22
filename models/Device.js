const mongoose = require("mongoose");
const DeviceSchema = new mongoose.Schema({
  deviceType: { type: String, required: true },
  deviceModel: { type: String, required: true },
  issueDescription: { type: String, required: true },
  phone: { type: String, required: true },
  additionalInfo: { type: String },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  imei : { type: String , default: undefined },
  cost : { type: Number },
  master : {type: String},
}, { timestamps: true })

module.exports = DeviceSchema;
