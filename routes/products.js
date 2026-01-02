import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/uplode.js";
import cloudinary from "../utils/cloudinary.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/", auth, adminAuth, async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    if (!title || !price || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    const product = await Product.create({
      title,
      description,
      price,
      category,
      images: []
    });
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },   
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/upload", auth, adminAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const stream = cloudinary.uploader.upload_stream(
      { folder: "health-hive" },
      async (error, result) => {
        if (error) return res.status(500).json({ message: "Upload failed" });

        await Product.updateOne(
          { _id: req.params.id },
          { $push: { images: result.secure_url } }   
        );

        res.json({ message: "Image uploaded successfully", image: result.secure_url });
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { new: qNew, category: qCategory } = req.query;
    let query = {};

    if (qCategory) query.category = qCategory;

    let productsQuery = Product.find(query);

    if (qNew) productsQuery = productsQuery.sort({ createdAt: -1 }).limit(1);

    const products = await productsQuery.lean();   
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean(); 
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Invalid product ID" });
  }
});

export default router;
