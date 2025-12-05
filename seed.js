import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Product from "./models/Product.js";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB for seeding");

  const sample = [
    { title: "Whey Protein 1kg", slug: "whey-protein-1kg", category: "protein", description: "Whey isolate 1kg", price: 1999, mrp: 2499, stock: 20, tags: ["whey","protein"] },
    { title: "Daily Multivitamin", slug: "multivitamin-daily", category: "vitamin", description: "Complete daily multivitamin", price: 499, mrp: 699, stock: 50, tags: ["vitamin","health"] },
    { title: "Omega-3 Fish Oil 1000mg", slug: "omega3-1000", category: "omega", description: "1000mg fish oil", price: 699, mrp: 899, stock: 30, tags: ["omega","fish-oil"] }
  ];

  await Product.deleteMany({});
  await Product.insertMany(sample);
  console.log("Seed finished, inserted:", sample.length);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error", err);
  process.exit(1);
});
