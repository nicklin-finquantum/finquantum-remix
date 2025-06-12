import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error('Missing MONGODB_URI');

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}