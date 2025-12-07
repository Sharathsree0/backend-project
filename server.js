import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";
import orderRoutes from "./routes/orders.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, message: "backend is alive" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URL || "mongodb://localhost:27017/health_hive";
console.log("🔌 database link is:", MONGO);
mongoose
  .connect(MONGO)
  .then(() => {
    console.log("mongodb connected");
    app.listen(PORT, () => console.log(`server running on ${PORT}`));
  })
  .catch((err) => console.error("mongo error", err));
