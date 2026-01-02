import express from "express";
import auth from "../middleware/auth.js";
import Product from "../models/Product.js";
import Rating from "../models/Rating.js";

const ratingRouter = express.Router();

ratingRouter.post("/", auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const exists = await Product.exists({ _id: productId });
    if (!exists) return res.status(404).json({ message: "Product not found" });
    const alreadyRated = await Rating.exists({ userId: req.userId, productId });
    if (alreadyRated) {
      return res.status(400).json({ message: "You already rated this product" });
    }
    const newRating = await Rating.create({
      userId: req.userId,
      productId,
      rating,
      comment
    });
    res.status(201).json({ message: "Rating added successfully", rating: newRating });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default ratingRouter;
