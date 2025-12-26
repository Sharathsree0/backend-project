import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/uplode.js";
import cloudinary from "../utils/cloudinary.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();
router.post("/", auth, adminAuth, async (req, res) => {
  try {
    const { title, price, category, stock } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const product = new Product({
      title,
      price,
      category,
      stock: stock || 0,
      images: []
    });

    await product.save();

    return res.status(201).json({
      message: "Product created",
      product
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});


router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { title, price, category, stock } = req.body;

    if (title !== undefined) product.title = title;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;

    await product.save();

    return res.json({
      message: "Product updated",
      product
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    return res.json({ message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});


router.post(
  "/:id/upload",
  auth,
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const stream = cloudinary.uploader.upload_stream(
        { folder: "health-hive" },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: "Upload failed" });
          }
          product.images.push(result.secure_url);
          await product.save();

          return res.json({
            message: "Image uploaded successfully",
            image: result.secure_url,
          });
        }
      );

      stream.end(req.file.buffer);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;

  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        category: qCategory, 
      });
    } else {
      products = await Product.find();
    }
    
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
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