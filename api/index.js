import { app } from '../server/src/app.js';
import { ensureServerlessDB } from '../server/src/config/db.js';

export default async function handler(req, res) {
  try {
    if (!req.url?.startsWith('/api/health')) {
      const connected = await ensureServerlessDB();
      if (!connected && req.url?.startsWith('/api/')) {
        return res.status(503).json({
          error: 'Cloud MongoDB is not configured yet. Add MONGODB_URI in Vercel Project Settings -> Environment Variables.',
        });
      }
    }
  } catch (err) {
    return res.status(503).json({
      error: `Database connection error: ${err.message}`,
    });
  }

  return app(req, res);
}
