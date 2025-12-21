import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
  // Link to the User who wrote the review
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // Link to the Product being reviewed
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },

  // The actual data
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String }, // Optional review text
}, { timestamps: true });

export default mongoose.model("Rating", RatingSchema);