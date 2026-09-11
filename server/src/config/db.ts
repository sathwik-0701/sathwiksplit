import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ MONGODB_URI environment variable is not defined in .env file.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('👉 Make sure your IP is whitelisted on MongoDB Atlas (Network Access -> 0.0.0.0/0) and database credentials are correct.');
  }
};
