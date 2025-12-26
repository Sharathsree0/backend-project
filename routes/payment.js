import express from "express";
import auth from "../middleware/auth.js"
import Payment from "../models/Payment.js";
import order from "../models/Order.js"

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
paymentRouter.post("/verify",auth,async(req,res)=>{
    const {paymentId}=req.body
    const payment= await Payment.findById(paymentId)
if(!payment){
    return res.status(404).json({message:"payment not found"})
}
if(payment.userId.toString()!== req.userId){
    return res.status(403).json({message:"unauthorized"})
}

if(payment.status !== "pending"){
    return res.status(400).json({message:"payment already done"})
}
payment.status ="success";
await payment.save();

await order.findOneAndUpdate(payment.orderId,{status:"paid"})

    return res.json({message:"payment verified",pamentstatus:payment.status,orderstatus:"paid"})
})
export default paymentRouter;
