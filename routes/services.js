const express = require("express");
const router = express.Router();
const ServiceRequest = require("../models/ServiceRequest");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const Contact = require("../models/Contact");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const newRequest = new ServiceRequest(req.body);
    await newRequest.save();
    res
      .status(201)
      .json({
        message: "Service request created successfully",
        data: newRequest,
      });
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const messages = await ServiceRequest.find().sort({ createdAt: -1 });
      res.json(messages);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id/status", authMiddleware, async (req, res) => {
  try {
    const {requestId} = req.params;
    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({message: "Request not found"});
    }

    res.json({status: request.status}); // например: "Pending"
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const {requestId} = req.params;
    const deletedRequest = await ServiceRequest.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return res.status(404).json({message: "Request not found"});
    }

    res.json({message: "Service request deleted successfully"});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.put("/:id/status", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const {requestId} = req.params;
    const {status} = req.body;

    const allowedStatuses = ["Pending", "In Progress", "Completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({message: "Invalid status value"});
    }

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      requestId,
      {status},
      {new: true}
    );

    if (!updatedRequest) {
      return res.status(404).json({message: "Request not found"});
    }

    res.json({
      message: "Status updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});
module.exports = router;
