import express from "express";
import Address from "../models/Address.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/address
 * Add a new address for logged-in user
 */
router.post("/", auth, async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      street,
      city,
      state,
      zipCode,
      country
    } = req.body;

    // basic validation
    if (!fullName || !mobile || !street || !city || !state || !zipCode) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const address = new Address({
      userId: req.userId, // comes from auth middleware
      fullName,
      mobile,
      street,
      city,
      state,
      zipCode,
      country
    });

    const savedAddress = await address.save();

    res.status(201).json({
      message: "Address added successfully",
      address: savedAddress
    });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/", auth, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      count: addresses.length,
      addresses
    });
  } catch (err) {
    console.error("Get address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/address/:id/default
 * Set an address as default for logged-in user
 */
router.put("/:id/default", auth, async (req, res) => {
  try {
    const addressId = req.params.id;

    // 1. Make sure address belongs to this user
    const address = await Address.findOne({
      _id: addressId,
      userId: req.userId
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // 2. Remove default from all other addresses
    await Address.updateMany(
      { userId: req.userId },
      { isDefault: false }
    );

    // 3. Set selected address as default
    address.isDefault = true;
    await address.save();

    res.json({
      message: "Default address updated",
      address
    });
  } catch (err) {
    console.error("Set default address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
