import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true, default: 1 },
  priceAtPurchase: { type: Number, required: true } 
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [OrderItemSchema],
  address: { type: String, required: true },
  total: { type: Number, required: true },
  payment: {
    method: { type: String, default: "mock" },
    status: { type: String, enum: ["pending","paid","failed"], default: "pending" },
    transactionId: { type: String }
  },
  status: { type: String, enum: ["created","processing","shipped","delivered","cancelled"], default: "created" }
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);
