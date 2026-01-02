import express from "express";
import auth from "../middleware/auth.js";
import Cart from "../models/Cart.js";

const router = express.Router();
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    res.json({ items: cart ? cart.items : [] });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/add", auth, async (req, res) => {
  const { productId } = req.body;
  try {
    const result = await Cart.updateOne(
      { user: req.userId, "items.product": productId },
      { $inc: { "items.$.qty": 1 } }
    );
    if (result.matchedCount === 0) {
      await Cart.updateOne(
        { user: req.userId },
        { $push: { items: { product: productId, qty: 1 } } },
        { upsert: true }
      );
    }
    res.json({ msg: "Product added to cart" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/remove/:productId", auth, async (req, res) => {
  const { productId } = req.params;
  try {
    await Cart.updateOne(
      { user: req.userId },
      { $pull: { items: { product: productId } } }
    );
    res.json({ msg: "Product removed from cart" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
