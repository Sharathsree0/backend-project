import express from "express";
import auth from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

/**
 * POST /api/orders/checkout
 * Body: { address: "delivery address" }
 */
router.post("/checkout", auth, async (req, res) => {
  try {
    const { address } = req.body;
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");

    // --- STEP 1: SAFETY CHECKS ---
    if (!address) return res.status(400).json({ msg: "Address required" });
    if (!cart || cart.items.length === 0) return res.status(400).json({ msg: "Cart is empty" });

    // --- STEP 2: PREPARE DATA ---
    const orderItems = [];
    let totalBill = 0;

    for (const item of cart.items) {
      const product = item.product;

      // Check existence and stock
      if (!product) return res.status(400).json({ msg: "Item not found" });
      if (product.stock < item.qty) {
        return res.status(400).json({ msg: `Out of stock: ${product.title}` });
      }

      // Add to valid list
      orderItems.push({
        product: product._id,
        qty: item.qty,
        priceAtPurchase: product.price
      });

      totalBill += product.price * item.qty;
    }

    // --- STEP 3: EXECUTE ACTIONS ---

    // A. Create the order
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      total: totalBill,
      address,
      payment: { method: "cod", status: "pending" } // Keeping it simple for now
    });

    // B. Reduce stock (The $inc shortcut)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    // C. Clear the cart
    await Cart.findOneAndDelete({ user: req.userId });

    // Done!
    return res.json({ msg: "Order placed successfully", orderId: order._id });

  } catch (err) {
    console.error("checkout error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/orders -> user order history
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

// GET /api/orders/:id -> order detail
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