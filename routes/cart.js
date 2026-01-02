import express from "express";
import auth from "../middleware/auth.js";
import Cart from "../models/Cart.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    if (!cart) return res.json({ items: [] });
    res.json({ items: cart.items });
  } catch (err) {
    console.error("Cart fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/add", auth, async (req, res) => {
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      await Cart.create({
        user: req.userId,
        items: [{ product: productId, qty: 1 }],
      });
      return res.json({ msg: "Cart created and product added" });
    }

    const exists = await Cart.findOne({ user: req.userId, "items.product": productId });
    if (exists) {
      await Cart.updateOne(
        { user: req.userId, "items.product": productId },
        { $inc: { "items.$.qty": 1 } }
      );
    } else {
      await Cart.updateOne(
        { user: req.userId },
        { $push: { items: { product: productId, qty: 1 } } }
      );
    }

    res.json({ msg: "Product added to cart" });
  } catch (err) {
    console.error("Cart add error:", err);
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
    console.error("Cart remove error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
