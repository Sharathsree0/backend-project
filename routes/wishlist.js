// routes/wishlist.js
import express from "express";
import auth from "../middleware/auth.js";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const router = express.Router();

// GET /api/wishlist  -> view wishlist
router.get("/", auth, async (req, res) => {
  try {
    const list = await Wishlist.findOne({ user: req.userId }).populate("products");
    if (!list) return res.json({ products: [] });
    return res.json({ products: list.products });
  } catch (err) {
    console.error("wishlist get error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/wishlist/toggle  -> add or remove
router.post("/toggle", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ msg: "productId required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    let wl = await Wishlist.findOne({ user: req.userId });
    if (!wl) {
      wl = new Wishlist({ user: req.userId, products: [] });
    }

    const exists = wl.products.find(p => String(p) === String(productId));
    if (exists) {
      wl.products = wl.products.filter(p => String(p) !== String(productId));
      await wl.save();
      return res.json({ msg: "removed", products: wl.products });
    } else {
      wl.products.push(productId);
      await wl.save();
      return res.json({ msg: "added", products: wl.products });
    }
  } catch (err) {
    console.error("wishlist toggle error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;
