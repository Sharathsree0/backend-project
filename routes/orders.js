import express from "express";
import auth from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();
router.post("/checkout", auth, async (req, res) => {
  try {
    const { address } = req.body;
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");

    
    if (!address) return res.status(400).json({ msg: "Address required" });
    if (!cart || cart.items.length === 0) return res.status(400).json({ msg: "Cart is empty" });

    
    const orderItems = [];
    let totalBill = 0;

    for (const item of cart.items) {
      const product = item.product;

    
      if (!product) return res.status(400).json({ msg: "Item not found" });
      if (product.stock < item.qty) {
        return res.status(400).json({ msg: `Out of stock: ${product.title}` });
      }

    
      orderItems.push({
        product: product._id,
        qty: item.qty,
        priceAtPurchase: product.price
      });

      totalBill += product.price * item.qty;
    }

    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      total: totalBill,
      address,
      payment: { method: "cod", status: "pending" } 
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    await Cart.findOneAndDelete({ user: req.userId });

    return res.json({ msg: "Order placed successfully", orderId: order._id });

  } catch (err) {
    console.error("checkout error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("items.product");
    return res.json(orders);
  } catch (err) {
    console.error("orders list error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});


router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    
    if (!order) return res.status(404).json({ msg: "Order not found" });
    if (String(order.user) !== String(req.userId)) return res.status(403).json({ msg: "Forbidden" });
    
    return res.json(order);
  } catch (err) {
    console.error("order detail error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;