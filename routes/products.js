import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Product.find({});
  res.json(items);
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ msg: "invalid id" });
  }
});

export default router;
