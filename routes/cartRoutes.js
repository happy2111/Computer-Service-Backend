const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

router.get("/", authMiddleware, cartController.getCart);
router.post("/add", authMiddleware, cartController.addToCart);
router.delete("/remove/:product_id", authMiddleware, cartController.removeFromCart);
router.delete("/clear", authMiddleware, cartController.clearCart);

module.exports = router;
