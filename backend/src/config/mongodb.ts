// MongoDB Connection

import mongoose from 'mongoose';

const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      console.warn('MongoDB URI not defined, skipping MongoDB connection');
      return;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log('MongoDB Connected: ' + conn.connection.host);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('MongoDB Connection failed (skipping): ' + errorMessage);
    // Don't exit process - MongoDB is optional
  }
};

export default connectMongoDB;
