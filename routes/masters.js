const express = require('express');
const router = express.Router();
const upload = require('../middleware/masterUpload');
const Masters = require('../models/Masters');
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const fs = require("fs")
const User = require("../models/User");
const mongoose = require("mongoose");

router.post("/avatar/:id", upload.single("avatar"), async (req, res, next) => {
  try {
    const masterId = req.params.id;
    const avatarPath = req.file.path;

    const master = await Masters.findByIdAndUpdate(
      masterId,
      { avatar: avatarPath },
      { new: true }
    );

    if (!master) {
      return res.status(404).json({ msg: "Master not found" });
    }

    res.status(200).json({
      msg: "Avatar uploaded successfully",
      avatar: master.avatar,
      master
    })
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.get("/", authMiddleware, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const masters = await Masters.find();
    const users = await User.find({}, { device: 1 });
    const masterStats = masters.map(master => {
      let count = 0;
      users.forEach(user => {
        if (Array.isArray(user.device)) {
          count += user.device.filter(d => d.master === master.name).length;
        }
      });
      return {
        master: master.name,
        phone: master.phone,
        deviceCount: count,
        avatar: master.avatar || "/public/empty-profile.jpg",
        description: master.description || ""
      };
    });
    res.json(masterStats);
  }
  catch (error) {
    next(error);
  }
})

router.get("/all", authMiddleware, authorizeRoles("admin","master"), async (req, res, next) => {
  try {
    const stats = req.query.stats;



    const masters = await User.find({role: "master"}).select("name phone _id password");
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

router.get("/:id", authMiddleware, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const master = await Masters.findById(req.params.id);
    if (!master) {
      return res.status(404).json({ msg: "Master not found" });
    }
    res.json(master);
  } catch (error) {
    next(error);
  }
})

router.post("/", authMiddleware, authorizeRoles("admin"),upload.single("avatar"), async (req, res, next) => {
  try {
    const { name, phone, description } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const avatarPath = req.file ? req.file.path : "/public/empty-profile.jpg";

    const newMaster = new Masters({
      name,
      phone,
      description: description || "",
      avatar: avatarPath
    })

    await newMaster.save();
    res.status(201).json(newMaster);
  } catch (error) {
    console.error('Error creating master:', error);
    next(error);
  }
})

router.put("/:id", authMiddleware, authorizeRoles("admin"), upload.single("avatar"), async (req, res, next) => {
  try {
    const masterId = req.params.id;
    const { name, phone, description } = req.body;

    const master = await Masters.findById(masterId);
    if (!master) {
      return res.status(404).json({ msg: "Master not found" });
    }

    if(req.file && master.avatar && !master.avatar.startsWith("/public")) {
      fs.unlink(master.avatar, (err) => {
        if (err) {
          console.error('Error deleting old avatar:', err);
        }
      })
    }

    master.name = name || master.name;
    master.phone = phone || master.phone;
    master.description = description || master.description;

    if (req.file) {
      master.avatar = req.file.path
    }
    await master.save();
    res.status(200).json({ msg: "Master updated successfully", master });
  } catch (error) {
    console.error('Error updating master:', error);
    next(error);
  }
})

module.exports = router;
