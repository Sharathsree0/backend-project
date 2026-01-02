import express from "express";
import auth from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

const router = express.Router();

router.post("/checkout", auth, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ message: "Address required" });
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
        $project: {
          product: "$productInfo._id",
          qty: "$items.qty",
          priceAtPurchase: "$productInfo.price",
          lineTotal: { $multiply: ["$items.qty", "$productInfo.price"] }
        }
      },
      {
        $group: {
          _id: null,
          items: {
            $push: {
              product: "$product",
              qty: "$qty",
              priceAtPurchase: "$priceAtPurchase"
            }
          },
          totalBill: { $sum: "$lineTotal" }
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
      payment: { method: "cod", status: "pending" }
    });
    await Cart.deleteOne({ user: req.userId });
    res.json({ message: "Order placed successfully", orderId: order._id });
  } catch (err) {
    console.error("checkout error", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
