import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/**
 * GET /api/products
 * optional query:
 *   ?category=protein
 *   ?q=searchText
 *   ?page=1&limit=20
 */
router.get("/", async (req, res) => {
  try {
    const { category, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.title = { $regex: q, $options: "i" };

    const skip = (Math.max(1, +page) - 1) * +limit;
    const items = await Product.find(filter).skip(skip).limit(+limit);
    res.json(items);
  } catch (err) {
    console.error("Products list error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/products/:id  (view single product by id)
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ msg: "Product not found" });
    res.json(p);
  } catch (err) {
    console.error("Product detail error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
