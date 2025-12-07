// routes/orders.js
import express from "express";
import auth from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

/**
 * POST /api/orders/checkout
 * Body: { address: "delivery address", payment: { method, details? } }
 * Steps:
 *  - find user's cart
 *  - calculate totals
 *  - verify stock
 *  - create order with payment.status = pending
 *  - (mock) process payment -> success
 *  - reduce product stock
 *  - clear cart
 */
router.post("/checkout", auth, async (req, res) => {
  try {
    const { address, payment } = req.body;
    if (!address) return res.status(400).json({ msg: "address required" });

    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    if (!cart || !cart.items.length) return res.status(400).json({ msg: "Cart is empty" });

    // Build order items and calculate total
    const items = [];
    let total = 0;
    for (const it of cart.items) {
      const prod = it.product;
      if (!prod) return res.status(400).json({ msg: "Product no longer available" });

      if (prod.stock < it.qty) {
        return res.status(400).json({ msg: `Not enough stock for ${prod.title}` });
      }
      items.push({ product: prod._id, qty: it.qty, priceAtPurchase: prod.price });
      total += prod.price * it.qty;
    }

    // Create order with pending payment
    const order = await Order.create({
      user: req.userId,
      items,
      address,
      total,
      payment: { method: (payment && payment.method) || "mock", status: "pending" }
    });

    // MOCK payment processing (always success here)
    // In real app integrate provider SDK here
    const mockTransactionId = `MOCK-${Date.now()}`;

    // On payment success: reduce stock
    for (const it of items) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.qty } });
    }

    // update order payment + status
    order.payment.status = "paid";
    order.payment.transactionId = mockTransactionId;
    order.status = "processing";
    await order.save();

    // clear cart
    await Cart.findOneAndDelete({ user: req.userId });

    return res.json({ msg: "order placed", order });
  } catch (err) {
    console.error("checkout error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/orders  -> user order history
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 }).populate("items.product");
    return res.json(orders);
  } catch (err) {
    console.error("orders list error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/orders/:id  -> order detail (user-only)
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
