import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    qty: { type: Number, default: 1 },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);
