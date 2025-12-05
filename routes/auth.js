import express, { Router } from "express"
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js"

const route =express.Router();

route.post("/login",async (req,res)=>{
    try{
        const {email,password}=req.body
        if(!email || !password){
            return res.status(400).json({message:"email or password required"})
        }

        const user = await User.findOne({ email });
if (!user) return res.status(400).json({ message: "invalid email or password" });

const storedHash = user.passwordhash || user.passwordhash;
if (!storedHash) return res.status(500).json({ message: "server error: password hash missing" });

const isMatch = await bcrypt.compare(password, storedHash);
if (!isMatch) return res.status(400).json({ message: "invalid email or password" });

if (!process.env.JWT_SECRET) return res.status(500).json({ message: "server misconfigured: JWT_SECRET missing" });

const token = JWT.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "12h" }
);
res.json({
  message: "login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email
  }
});
    }catch(err){
        console.error("login error",err)
        res.status(500).json({message:"server error"})
    }
})

route.post("/register",async (req,res)=>{
    const {name,email,password}=req.body

    if(!name || !email || !password){
        return res.status(400).json({message:"all required"});
    }
const existing = await User.findOne({email})
    if(existing){
       return res.status(400).json({message:"already exist"});
    }
const passwordhash = await bcrypt.hash(password,10)

const users = await User.create({
    name,email,passwordhash
})

const token = JWT.sign(
    {id:users._id},
    process.env.JWT_SECRET,
    {expiresIn:"12h"}
)
res.json({
    message:"registerd",
    token,
    user:{
        id:users._id,
        name:users.name,
        email:users.email,
    }
  })
})
export default route;