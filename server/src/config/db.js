import mongoose from 'mongoose';
import { ENV } from './env.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[LIFE OS Database] Connected to MongoDB at: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[LIFE OS Database] Connection error:`, error.message);
    // Don't crash immediately in testing or if offline, but throw
    throw error;
  }
}
