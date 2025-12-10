import mongoose from "mongoose";

/**
 * Hàm kết nối MongoDB
 * @throws {Error} Nếu kết nối thất bại
 */
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectMongoDB;
