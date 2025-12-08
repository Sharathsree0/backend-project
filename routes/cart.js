import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
  if (!cart) return res.json({ items: [] });
  res.json(cart);
});

router.post("/add", auth, async (req, res) => {
  const { productId, qty = 1 } = req.body;

  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) cart = await Cart.create({ user: req.userId, items: [] });

  const item = cart.items.find((i) => String(i.product) === String(productId));

  if (item) item.qty += qty;
  else cart.items.push({ product: productId, qty });

  await cart.save();
  const fresh = await Cart.findById(cart._id).populate("items.product");

  res.json(fresh);
});
router.post("/remove", auth, async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) return res.status(404).json({ msg: "Cart not found" });

  cart.items = cart.items.filter((item) => String(item.product) !== productId);

  await cart.save();
  const fresh = await Cart.findById(cart._id).populate("items.product");
  res.json(fresh);
});
export default router;
