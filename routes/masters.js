const express = require('express');
const router = express.Router();
const upload = require('../middleware/masterUpload');
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const fs = require("fs")
const User = require("../models/User");
const mongoose = require("mongoose");

router.get("/all", authMiddleware, async (req, res, next) => {
  try {
    const masters = await User.find({role: "master"}).select("avatar name phone _id description position ");
    res.json(masters);
  }catch (error) {
    next(error);
  }
})

router.get("/stats", authMiddleware, authorizeRoles("admin", "master"), async (req, res, next) => {
  try {
    const users = await User.find();

    const masterDeviceCount = new Map();

    for (const user of users) {
      for (const device of user.device) {
        const masterId = device.master?.toString();
        if (mongoose.Types.ObjectId.isValid(masterId)) {
          if (!masterDeviceCount.has(masterId)) {
            masterDeviceCount.set(masterId, 1);
          } else {
            masterDeviceCount.set(masterId, masterDeviceCount.get(masterId) + 1);
          }
        }
      }
    }

    const masters = await User.find({ _id: { $in: Array.from(masterDeviceCount.keys()) } });

    const result = masters.map(master => ({
      masterId: master._id,
      phone: master.phone,
      masterName: master.name,
      count: masterDeviceCount.get(master._id.toString()) || 0
    }));

    res.json(result);

  }
  catch (error) {}
})



// router.put("/:id", authMiddleware, authorizeRoles("admin"), upload.single("avatar"), async (req, res, next) => {
//   try {
//     const masterId = req.params.id;
//     const { name, phone, description } = req.body;
//
//     const master = await Masters.findById(masterId);
//     if (!master) {
//       return res.status(404).json({ msg: "Master not found" });
//     }
//
//     if(req.file && master.avatar && !master.avatar.startsWith("/public")) {
//       fs.unlink(master.avatar, (err) => {
//         if (err) {
//           console.error('Error deleting old avatar:', err);
//         }
//       })
//     }
//
//     master.name = name || master.name;
//     master.phone = phone || master.phone;
//     master.description = description || master.description;
//
//     if (req.file) {
//       master.avatar = req.file.path
//     }
//     await master.save();
//     res.status(200).json({ msg: "Master updated successfully", master });
//   } catch (error) {
//     console.error('Error updating master:', error);
//     next(error);
//   }
// })

module.exports = router;
