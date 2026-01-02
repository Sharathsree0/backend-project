import express from "express";
import crypto from "crypto";
import razorpay from "../utils/razorpay.js";
import auth from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

const router = express.Router();

router.post("/verify", auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, address } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment verification failed" });
  }
  try {
    const cartAgg = await Cart.aggregate([
      { $match: { user: req.userId } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: null,
          items: {
            $push: {
              product: "$productInfo._id",
              qty: "$items.qty",
              priceAtPurchase: "$productInfo.price"
            }
          },
          totalBill: {
            $sum: { $multiply: ["$items.qty", "$productInfo.price"] }
          }
        }
      }
    ]);
    if (!cartAgg || cartAgg.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const { items: orderItems, totalBill } = cartAgg[0];
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      total: totalBill,
      address,
      payment: {
        method: "razorpay",
        status: "paid",
        paymentId: razorpay_payment_id
      }
    });
    await Cart.updateOne({ user: req.userId }, { $set: { items: [] } });
    res.json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
