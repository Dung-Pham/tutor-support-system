/**
 * Script tạo admin account
 * Chạy: node create-admin.js
 */

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);

// Define User schema
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  hashedPassword: String,
  role: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model("User", userSchema);

// Create or update admin
const password = "123456";
const hashedPassword = await bcrypt.hash(password, 10);

const admin = await User.findOneAndUpdate(
  { email: "admin@tutorsupport.com" },
  {
    fullName: "Admin System",
    hashedPassword,
    role: "admin",
    avatar:
      "https://ui-avatars.com/api/?name=Admin+System&background=0D8ABC&color=fff",
    updatedAt: new Date(),
  },
  { upsert: true, new: true }
);

console.log("✅ Admin created/updated successfully!");
console.log("Email: admin@tutorsupport.com");
console.log("Password: 123456");
console.log("ID:", admin._id);

await mongoose.disconnect();
