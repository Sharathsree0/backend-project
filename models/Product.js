import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    description: String,
    category: String,
    images: [String],
    price: Number,
    mrp: Number,
    stock: Number,
    tags: [String],
    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
