import mongoose from 'mongoose';
import { ENV } from './env.js';

let cachedConnectPromise = null;

export async function connectDB() {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[LIFE OS Database] Connected to MongoDB at: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[LIFE OS Database] Connection error:`, error.message);
    throw error;
  }
}

export async function ensureServerlessDB() {
  if (mongoose.connection.readyState === 1) return true;
  if (!ENV.MONGODB_URI || ENV.MONGODB_URI.includes('localhost')) {
    return false;
  }
  if (!cachedConnectPromise) {
    cachedConnectPromise = mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    }).catch((err) => {
      cachedConnectPromise = null;
      throw err;
    });
  }
  await cachedConnectPromise;
  return true;
}
