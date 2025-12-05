import express, { Router } from "express"
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
import user from "../models/User"

const route =express.Router();

route.post("/register",async (req,res)=>{
    const {name,email,password}=req.body

    if(!name || !email || !password){
        return res.status(400).json({message:"all required"});
    }
const existing = await user.findOne({email})
    if(existing){
       return res.status(400).json({message:"already exist"});
    }
const passwordhash = await bcrypt.hash(password,10)

const users = await user.create({
    name,email,passwordhash
})

const token = JWT.sign(
    {id:user._id},
    process.env.JWT_SECRET,
    {expiresIn:"12h"}
)

res.json({
    message:"registerd",
    token,
    user:{
        id:user._id,
        name:user.name,
        email:user.email,
    }
  })
})
export default route;