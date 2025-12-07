import express from "express";
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "all fields required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, passwordHash });

  const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });

  res.json({
    message: "registered",
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ message: "invalid credentials" });

  const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });

  res.json({
    message: "login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export default router;
