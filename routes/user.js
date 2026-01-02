import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash"); 
    res.json(users);
  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
