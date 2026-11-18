import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import captureRoutes from './routes/captureRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import { processPendingJobs } from './services/durableScheduler.js';

export const app = express();

// Trust reverse proxy (Cloudflare Tunnel, Render, Railway, Nginx)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible API responses and client embed
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedExact = [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'];
    if (
      allowedExact.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
      /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin) ||
      /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/i.test(origin) ||
      /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/i.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(cookieParser(ENV.SESSION_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Global API rate limit
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'LIFE OS Backend Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Durable scheduler cron trigger (for Vercel Cron / external schedulers)
app.get('/api/cron/tick', async (req, res, next) => {
  try {
    if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized cron trigger' });
    }
    await processPendingJobs();
    res.status(200).json({ ok: true, processedAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/capture', captureRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/career', careerRoutes);

// Serve static client build if it exists
app.use(express.static(clientDistPath));

// SPA fallback for frontend client routing
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Catch-all 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
});

// Central Error Handler
app.use(errorHandler);
