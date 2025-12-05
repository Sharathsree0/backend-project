import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String },           
  description: { type: String },
  category: { type: String, index: true }, // e.g. "protein", "vitamin"
  images: [String],
  price: { type: Number, required: true },
  mrp: { type: Number },
  stock: { type: Number, default: 0 },
  tags: [String],
  rating: {
    avg: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model("Product", ProductSchema);
