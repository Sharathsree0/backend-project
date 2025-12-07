import express from "express";
import auth from "../middleware/auth.js";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const router = express.Router();

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

router.post("/toggle", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ msg: "productId required" });

    let wl = await Wishlist.findOne({ user: req.userId });
    if (!wl) wl = new Wishlist({ user: req.userId, products: [] });

    const index = wl.products.findIndex(p => String(p) === String(productId));

    if (index === -1) {
      
      wl.products.push(productId);
      await wl.save();
      res.json({ msg: "added", products: wl.products });
    } else {
      
      wl.products.splice(index, 1);
      await wl.save();
      res.json({ msg: "removed", products: wl.products });
    }

  } catch (err) {
    console.error("wishlist toggle error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;