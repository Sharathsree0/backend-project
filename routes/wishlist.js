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

router.post("/add", auth, async (req, res) => {
 const {productId}=req.body;

 await Wishlist.updateOne(
  {user:req.userId},
{$addToSet:{products:productId}},
{upsert:true}
)
 res.json({ message: "Product added to wishlist" });
});
router.delete("/remove/:productId", auth, async (req, res) => {
  const { productId } = req.params;

  await Wishlist.updateOne(
    { user: req.userId },
    { $pull: { products: productId } }
  );

  res.json({ message: "Product removed from wishlist" });
});
export default router;