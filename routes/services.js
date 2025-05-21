const express = require("express");
const router = express.Router();
const ServiceRequest = require("../models/ServiceRequest");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

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
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
