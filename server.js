import express from "express";
import cors from "cors"
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
import auth from "./routes/auth.js";
import products from "./routes/products.js";
const app =express();
dotenv.config();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json())
app.use("/api/auth", auth);
app.use("/api/products", products);

app.get("/",(req,res)=>res.json({ok:true,message:"backend is alive"}))

const PORT = process.env.PORT || 5000
const MONGO = process.env.MONGO_URL || 'mongodb://localhost:27017/backend_project'

mongoose.connect(MONGO)
.then(()=>{
    console.log("mongodb connected")
    app.listen(PORT)
})
.catch(err=>{
    console.error("connection failed",err)
    process.exit(1);
})


