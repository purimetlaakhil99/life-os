import { ENV } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'An unexpected internal server error occurred';

  if (ENV.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    error: message,
    ...(ENV.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
