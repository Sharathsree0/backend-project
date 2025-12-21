import express from "express";
import auth from "../middleware/auth.js";
import Product from "../models/Product.js";
import Rating from "../models/Rating.js";

const ratingRouter= express.Router()
ratingRouter.post("/",auth,async(req,res)=>{
    

    const {productId}=req.body
    const product =await Product.findById(productId)
    if(!product){
        return res.status(404).json({message:"product not found"})
    }
   const existingRating= await Rating.findOne({
    userId:req.userId,
    productId:productId
   })
   if (existingRating) {
  return res.status(400).json({ message: "You already rated this product" });
}
const { rating, comment } = req.body;

const newRating = new Rating({
  userId: req.userId,
  productId: productId,
  rating,
  comment
});

await newRating.save();

   res.status(201).json({
  message: "Rating added successfully",
  rating: newRating
});
})

export default ratingRouter

