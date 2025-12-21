import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/uplode.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

router.post("/:id/upload", upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "health-hive" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    product.images.push(result.secure_url);
    await product.save();

    return res.json({
      message: "Image uploaded",
      image: result.secure_url,
      product,
    });
  } catch (err) {
    console.error("Upload route error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

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