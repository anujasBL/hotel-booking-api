// Export all middleware from a single file for convenience
export * from './errorHandler';
export * from './auth';
export * from './validation';
export * from './requestLogger';
export * from './cors';

import { Application } from 'express';
import helmet from 'helmet';
import express from 'express';
import { corsMiddleware } from './cors';
import { requestLogger } from './requestLogger';
import { errorHandler, notFoundHandler } from './errorHandler';

// Apply global middleware to Express app
export const setupMiddleware = (app: Application): void => {
  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS middleware
  app.use(corsMiddleware);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware
  app.use(requestLogger);

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);
};

// Apply error handling middleware (should be last)
export const setupErrorHandling = (app: Application): void => {
  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);
};

export default {
  setupMiddleware,
  setupErrorHandling,
};
