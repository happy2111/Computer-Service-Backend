const express = require("express");
const router = express.Router();
const ServiceRequest = require("../models/ServiceRequest");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const User = require("../models/User");
const { sendPushNotifications } = require("./pushNotifications");


router.post("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    user.device.push(req.body);
    await user.save();

    res.status(201).json({
      message: "Device added successfully",
      // data: user.device[user.device.length - 1],
      data: user
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})


router.get("", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/all", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const allDevices = users.flatMap(user =>
      user.device.map(device => ({
        userId: user._id,
        userName: user.name,
        ...device.toObject() // если не сделать, то будут методы Mongoose-сабдокумента
      }))
    );

    res.json(allDevices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:deviceId/status", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const device = user.device.id(req.params.deviceId);
    if (!device) return res.status(404).json({ message: "Device not found" });
    res.json({ status: device.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:deviceId/status", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const allowedStatuses = ["pending", "in-progress", "completed", "unrepairable"];
    const { status } = req.body;
    const { userId } = req.query;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const device = user.device.id(req.params.deviceId);
    if (!device) return res.status(404).json({ message: "Device not found" });
    device.status = status;
    await user.save();
    res.json({ message: "Status updated", data: device });
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
});

router.put("/:deviceId/picked", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const device = user.device.id(req.params.deviceId);
    if (!device) return res.status(404).json({ message: "Device not found" });

    device.packedUp = status
    await user.save()
    res.json({ message: "Picked Status updated", data: device });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.patch("/:deviceId", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { userId } = req.query;
    const updates = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const device = user.device.id(req.params.deviceId);
    if (!device) return res.status(404).json({ message: "Device not found" });

    Object.keys(updates).forEach(key => {
      device[key] = updates[key];
    });

    await user.save();
    res.json({ message: "Device updated successfully", data: device });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/:deviceId", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const deviceIndex = user.device.findIndex(d => d._id.toString() === req.params.deviceId);
    if (deviceIndex === -1) return res.status(404).json({ message: "Device not found" });
    user.device.splice(deviceIndex, 1);
    await user.save();
    res.json({ message: "Device deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/add", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { userId, ...deviceData } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // deviceData.cost = `${deviceData.cost} / ${deviceData.costOr}`
    user.device.push(deviceData);
    await user.save();

    // await sendPushNotifications({
    //   title: 'Добавлен новый сервис',
    //   body: 'Проверьте заявки'
    // });

    res.status(201).json({
      message: "Device added successfully to user",
      data: user.device[user.device.length - 1],
      userId: user._id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});





// router.post("/", authMiddleware, async (req, res) => {
//   try {
//     const newRequest = new ServiceRequest(req.body);
//     await newRequest.save();
//     res
//       .status(201)
//       .json({
//         message: "Service request created successfully",
//         data: newRequest,
//       });
//   } catch (error) {
//     res.status(400).json({error: error.message});
//   }
// });

// router.get(
//   "/",
//   authMiddleware,
//   authorizeRoles("admin"),
//   async (req, res, next) => {
//     try {
//       const messages = await ServiceRequest.find().sort({createdAt: -1});
//       res.json(messages);
//     } catch (err) {
//       next(err);
//     }
//   }
// );
//
// router.get("/:requestId/status", authMiddleware, async (req, res) => {
//   try {
//     const {requestId} = req.params;
//     const request = await ServiceRequest.findById(requestId);
//
//     if (!request) {
//       return res.status(404).json({message: "Request not found"});
//     }
//
//     res.json({status: request.status}); // например: "Pending"
//   } catch (error) {
//     res.status(500).json({error: error.message});
//   }
// });
//
// router.delete("/:requestId", authMiddleware, authorizeRoles("admin"), async (req, res) => {
//   try {
//     const {requestId} = req.params;
//     const deletedRequest = await ServiceRequest.findByIdAndDelete(requestId);
//
//     if (!deletedRequest) {
//       return res.status(404).json({message: "Request not found"});
//     }
//
//     res.json({message: "Service request deleted successfully"});
//   } catch (error) {
//     res.status(500).json({error: error.message});
//   }
// });
//
// router.put("/:requestId/status/test", authMiddleware, async (req, res) => {
//   try {
//     const {requestId} = req.params;
//     const {status} = req.body;
//
//     const allowedStatuses = ["pending", "in-progress", "completed"];
//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({message: "Invalid status value"});
//     }
//
//     const updatedRequest = await User.findByIdAndUpdate(
//       requestId,
//       {status},
//       {new: true}
//     );
//
//     if (!updatedRequest) {
//       return res.status(404).json({message: "Request not found"});
//     }
//
//     res.json({
//       message: "Status updated successfully",
//       data: updatedRequest,
//     });
//   } catch (error) {
//     res.status(500).json({error: error.message});
//   }
// });
module.exports = router;
