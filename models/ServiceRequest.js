const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema(
  {
    serviceType: { type: String, required: true },
    deviceType: { type: String, required: true },
    deviceModel: { type: String, required: true },
    issueDescription: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    preferredDate: { type: Date },
    additionalInfo: { type: String },
      status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed"],
          default: "Pending",
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema);
