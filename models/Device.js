const mongoose = require("mongoose");
const DeviceSchema = new mongoose.Schema({
  orderNumber: { type: Number },
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
  master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  statusComment: { type: String, default: "" },
  packedUp: { type: Boolean, default: false },
}, { timestamps: true })

// Статический метод для получения следующего номера
DeviceSchema.statics.getNextOrderNumber = async function() {
  try {
    const User = mongoose.model('User');
    const users = await User.find({});

    let maxNumber = 0;
    users.forEach(user => {
      if (user.device && Array.isArray(user.device)) {
        user.device.forEach(device => {
          if (device.orderNumber && device.orderNumber > maxNumber) {
            maxNumber = device.orderNumber;
          }
        });
      }
    });

    return maxNumber + 1;
  } catch (error) {
    console.error('Error in getNextOrderNumber:', error);
    throw error;
  }
};

// Middleware перед сохранением
DeviceSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.orderNumber) {
      const User = mongoose.model('User');
      const users = await User.find({});

      let maxNumber = 0;
      users.forEach(user => {
        if (user.device && Array.isArray(user.device)) {
          user.device.forEach(device => {
            if (device.orderNumber && device.orderNumber > maxNumber) {
              maxNumber = device.orderNumber;
            }
          });
        }
      });

      this.orderNumber = maxNumber + 1;
    }
    next();
  } catch (error) {
    next(error);
  }
});



module.exports = DeviceSchema;
