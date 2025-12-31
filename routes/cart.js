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
  const { productId} = req.body;

  const incresult= await Cart.updateOne(
    {user:req.userId,"items.product":productId},
  {$inc:{"items.$.qty":1}}
);
if(incresult.matchedCount===0){
  await Cart.updateOne(
  {user:req.userId},
{
  $push:{
    items:{product:productId,qty:1}
  }
},{upsert:true}
) 
}
 return res.json({message:"product added to cart"})
});

router.delete("/delete/:productId",async(req,res)=>{
  const {productId}=req.params;

  await Cart.updateOne(
    {user:req.userId},
  {$pull:{items:{product:productId}}}
);
res.json({message:"product removed from cart"})
})
export default router;
