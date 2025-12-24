/**
 * File: scripts/seedUsers.ts
 * Mục đích: Tạo dữ liệu test cho users
 * Chạy: npm run seed
 */

import "dotenv/config";
import bcrypt from "bcrypt";
import { connectSQLServer } from "../config/sqlserver.js";
import User from "../models/sql/User.js";

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "123456";

const users = [
  {
    email: "admin@gmail.com",
    firstName: "Admin",
    lastName: "System",
    displayName: "Admin",
    role: "admin" as const,
    bio: "Quản trị viên hệ thống",
  },
  {
    email: "tutor1@gmail.com",
    firstName: "Nguyễn",
    lastName: "Văn Tutor",
    displayName: "Tutor Nguyễn",
    role: "tutor" as const,
    bio: "Gia sư Toán học với 5 năm kinh nghiệm",
  },
  {
    email: "tutor2@gmail.com",
    firstName: "Trần",
    lastName: "Thị Hoa",
    displayName: "Tutor Hoa",
    role: "tutor" as const,
    bio: "Gia sư Tiếng Anh, IELTS 8.0",
  },
  {
    email: "student1@gmail.com",
    firstName: "Lê",
    lastName: "Văn Nam",
    displayName: "Student Nam",
    role: "student" as const,
    bio: "Sinh viên năm 3 PTIT",
  },
  {
    email: "student2@gmail.com",
    firstName: "Phạm",
    lastName: "Thị Lan",
    displayName: "Student Lan",
    role: "student" as const,
    bio: "Sinh viên năm 2 PTIT",
  },
  {
    email: "student3@gmail.com",
    firstName: "Hoàng",
    lastName: "Minh Đức",
    displayName: "Student Đức",
    role: "student" as const,
    bio: "Sinh viên năm 1 PTIT",
  },
];

async function seedUsers() {
  try {
    console.log("🔄 Connecting to SQL Server...");
    await connectSQLServer();

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    console.log("👤 Creating users...\n");

    for (const userData of users) {
      // Check if user already exists
      const existing = await User.findOne({ where: { email: userData.email } });

      if (existing) {
        console.log(`  ⏭️  User exists: ${userData.email}`);
        continue;
      }

      const user = await User.create({
        ...userData,
        hashedPassword,
        isActive: true,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      });

      console.log(`  ✅ Created: ${user.email} (${user.role})`);
    }

    console.log("\n✅ Seed completed!");
    console.log("\n📋 Test accounts (password: 123456):");
    console.log("  ┌─────────────────────────┬──────────┐");
    console.log("  │ Email                   │ Role     │");
    console.log("  ├─────────────────────────┼──────────┤");
    console.log("  │ admin@tutor.com         │ admin    │");
    console.log("  │ tutor1@tutor.com        │ tutor    │");
    console.log("  │ tutor2@tutor.com        │ tutor    │");
    console.log("  │ student1@tutor.com      │ student  │");
    console.log("  │ student2@tutor.com      │ student  │");
    console.log("  │ student3@tutor.com      │ student  │");
    console.log("  └─────────────────────────┴──────────┘");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedUsers();
