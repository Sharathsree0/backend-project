import express from "express";
import auth from "../middleware/auth.js"
import Payment from "../models/Payment.js";

const paymentRouter = express.Router();

paymentRouter.post("/initiate",auth,async(req,res)=>{
    const {orderId,amount}=req.body
const payment =new Payment({
    orderId,
    userId:req.userId,
    amount
})
await payment.save();
res.status(201).json({
    message:"payment initiated",
    payment
})

})
export default paymentRouter;
