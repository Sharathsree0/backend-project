import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Product from "./models/Product.js";

async function seed() {
  const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/backend-project ";
  await mongoose.connect(MONGO);
  console.log("Connected to DB for seeding");

  const products = [
    {
      title: "Whey Protein 1kg",
      slug: "whey-protein-1kg",
      description: "High-quality whey protein",
      category: "protein",
      images: [],
      price: 1999,
      mrp: 2499,
      stock: 20,
      tags: ["protein", "whey"]
    },
    {
      title: "Daily Multivitamin",
      slug: "daily-multivitamin",
      description: "Complete daily vitamin",
      category: "vitamin",
      images: [],
      price: 499,
      mrp: 699,
      stock: 50,
      tags: ["vitamin"]
    },
    {
      title: "Omega 3 Fish Oil",
      slug: "omega-3",
      description: "1000mg omega 3 fish oil capsules",
      category: "omega",
      images: [],
      price: 699,
      mrp: 899,
      stock: 30,
      tags: ["omega", "fish oil"]
    }
  ];

  await Product.deleteMany({});
  await Product.insertMany(products);

  console.log("Seeding complete. Inserted:", products.length);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
