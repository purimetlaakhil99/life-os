import { app } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { startScheduler } from './services/durableScheduler.js';

async function bootstrap() {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start Durable Background Job Scheduler
    startScheduler(15000); // Poll every 15 seconds

    // 3. Start HTTP Server
    const server = app.listen(ENV.PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 LIFE OS Server running on port ${ENV.PORT}`);
      console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
      console.log(`🔗 API Base: http://localhost:${ENV.PORT}/api`);
      console.log(`💻 Client Allowed: ${ENV.CLIENT_URL}`);
      console.log(`===============================================`);
    });

    const shutdown = () => {
      console.log('Shutting down LIFE OS gracefully...');
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start LIFE OS server:', err);
    process.exit(1);
  }
}

bootstrap();
