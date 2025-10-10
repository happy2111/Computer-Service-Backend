const mongoose = require("mongoose");

const measureSchema = new mongoose.Schema(
  {
    name: { type: String },
    id: { type: String }, // ID из внешней системы
  },
  { _id: false } // не создаем внутренний ObjectId
);


const cartItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: String, // ID из внешней системы (не ObjectId)
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    measure: {
      type: measureSchema,
      required: false,
    },
    category_id: {
      type: String,
      default: null,
    },
    organization_ids: {
      type: [String],
      default: [],
    },
  },
  { _id: false } // у айтемов не будет отдельного ObjectId
);

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    total_amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "ordered", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
