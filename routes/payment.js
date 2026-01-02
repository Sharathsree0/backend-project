import express from "express";
import crypto from "crypto";
import razorpay from "../utils/razorpay.js";
import auth from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

router.post("/create-order", auth, async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, 
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  try {
    const razorOrder = await razorpay.orders.create(options);
    res.json({
      razorpayOrderId: razorOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

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
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      qty: item.qty,
      priceAtPurchase: item.product.price,
    }));

    const totalBill = orderItems.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.qty,
      0
    );

    for (const item of orderItems) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } }
      );
      if (result.matchedCount === 0) {
        return res.status(400).json({ message: "Insufficient stock for one or more items" });
      }
    }

    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      total: totalBill,
      address,
      payment: {
        method: "razorpay",
        status: "paid",
        paymentId: razorpay_payment_id,
      },
    });

    await Cart.updateOne({ user: req.userId }, { $set: { items: [] } });

    res.json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
