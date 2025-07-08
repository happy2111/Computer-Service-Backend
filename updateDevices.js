const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function updateExistingDevices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Подключились к базе данных");

    const users = await User.find({});
    let orderNumber = 1;

    for (const user of users) {
      if (user.device && Array.isArray(user.device)) {
        const updatedDevices = user.device.map(device => {
          if (!device.orderNumber) {
            device.orderNumber = orderNumber++;
          }
          return device;
        });

        user.device = updatedDevices;
        await user.save();
      }
    }

    console.log("Обновление завершено успешно!");
    process.exit(0);

  } catch (error) {
    console.error("Ошибка:", error);
    process.exit(1);
  }
}

updateExistingDevices();