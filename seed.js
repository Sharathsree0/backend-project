import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Product from "./models/Product.js";

async function seed() {
const MONGO = process.env.MONGO_URL;
  await mongoose.connect(MONGO);

  await Product.deleteMany({});

  await Product.insertMany([
    {
      title: "Whey Protein 1kg",
      slug: "whey",
      description: "High quality whey",
      category: "protein",
      price: 1999,
      mrp: 2499,
      stock: 20,
      images: [],
      tags: ["protein"],
    },
    {
      title: "Multivitamin",
      slug: "multi",
      description: "Daily multivitamin",
      category: "vitamin",
      price: 499,
      mrp: 699,
      stock: 50,
      images: [],
      tags: ["vitamin"],
    },
  ]);

  console.log("Seeded!");
  process.exit(0);
}

seed();
