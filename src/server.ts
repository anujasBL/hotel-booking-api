import express, { Application } from 'express';
import { config } from './config/env';
import { logger } from './config/logger';
import { setupMiddleware, setupErrorHandling } from './middleware';
import routes from './routes';
import docsRoutes from './routes/docsRoutes';

// Create Express application
const app: Application = express();

// Setup middleware
setupMiddleware(app);

// Mount API routes
app.use('/api/v1', routes);

// Mount documentation routes
app.use('/docs', docsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Hotel Booking API is running!',
    version: '1.0.0',
    documentation: '/docs',
    health: '/api/v1/health',
    endpoints: {
      hotels: '/api/v1/hotels',
      bookings: '/api/v1/bookings',
      users: '/api/v1/users',
    },
  });
});

// Setup error handling (must be last)
setupErrorHandling(app);

// Start server
const PORT = config.app.port;

app.listen(PORT, () => {
  logger.info(`🚀 Hotel Booking API started successfully!`, {
    port: PORT,
    environment: config.app.env,
    documentation: `http://localhost:${PORT}/docs`,
    health: `http://localhost:${PORT}/api/v1/health`,
  });

  // Log important endpoints
  logger.info('📋 Available endpoints:', {
    root: `http://localhost:${PORT}`,
    health: `http://localhost:${PORT}/api/v1/health`,
    docs: `http://localhost:${PORT}/docs`,
    hotels: `http://localhost:${PORT}/api/v1/hotels/search`,
    chatSearch: `http://localhost:${PORT}/api/v1/hotels/chat-search`,
    bookings: `http://localhost:${PORT}/api/v1/bookings`,
    users: `http://localhost:${PORT}/api/v1/users`,
  });

  // Log configuration (without secrets)
  logger.info('⚙️ Configuration:', {
    nodeEnv: config.app.env,
    logLevel: config.logging.level,
    frontendUrl: config.app.frontendUrl,
    supabaseUrl: config.supabase.url,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
