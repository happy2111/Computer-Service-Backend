const mongoose = require("mongoose");
const User = require("../models/User");

async function runFix() {
  await mongoose.connect("mongodb+srv://muhammadyusufa2111:nXI4OUfaMekbGF1I@myapp-cluster.0ofekjh.mongodb.net/test?retryWrites=true&w=majority&appName=myapp-cluster");

  const users = await User.find();

  let fixedCount = 0;

  for (const user of users) {
    const oldLength = user.device.length;
    user.device = user.device.filter(device =>
      mongoose.Types.ObjectId.isValid(device.master)
    );
    if (user.device.length !== oldLength) {
      await user.save();
      fixedCount++;
    }
  }

  console.log(`Готово! Обновлено ${fixedCount} пользователей`);
  mongoose.disconnect();
}

runFix();
