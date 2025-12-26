import User from "../models/User.js";

const adminAuth = async (req, res, next) => {
  console.log("REQ.USERID:", req.userId);

  const user = await User.findById(req.userId);
  console.log("USER FROM DB:", user);

  if (!user || user.isAdmin !== true) {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};

export default adminAuth;
