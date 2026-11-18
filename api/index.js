import mongoose from 'mongoose';
import { app } from '../server/src/app.js';
import { ENV } from '../server/src/config/env.js';

let dbConnectPromise = null;

async function ensureDatabaseConnection() {
  if (mongoose.connection.readyState === 1) return;
  if (!ENV.MONGODB_URI || ENV.MONGODB_URI.includes('localhost')) {
    // Allow health endpoint to work without hanging on unavailable localhost DB in cloud serverless
    return;
  }
  if (!dbConnectPromise) {
    dbConnectPromise = mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    }).catch((err) => {
      dbConnectPromise = null;
      console.error('[Vercel API] MongoDB connection error:', err.message);
      throw err;
    });
  }
  await dbConnectPromise;
}

export default async function handler(req, res) {
  try {
    if (!req.url?.startsWith('/api/health')) {
      await ensureDatabaseConnection();
    }
  } catch (err) {
    return res.status(503).json({
      error: 'Database connection unavailable. Please configure MONGODB_URI in Vercel Environment Variables.',
    });
  }

  return app(req, res);
}
