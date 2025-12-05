import express from "express";
import cors from "cors"
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
import auth from "./middleware/auth.js";

const app =express();
dotenv.config();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json())

app.get("/",(req,res)=>res.json({ok:true,message:"backend is alive"}))

const PORT = process.env.PORT || 5000
const MONGO = process.env.MONGO_URL || 'mongodb://localhost:27017'

mongoose.connect(MONGO)
.then(()=>{
    console.log("mongodb connected")
    app.listen(PORT)
})
.catch(err=>{
    console.error("connection failed",err)
    process.exit(1);
})


