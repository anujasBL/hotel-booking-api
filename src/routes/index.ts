import { Router, Request, Response } from 'express';
import hotelRoutes from './hotelRoutes';
import bookingRoutes from './bookingRoutes';
import userRoutes from './userRoutes';
import testRoutes from './testRoutes';
import { ApiResponse } from '../types';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    },
    message: 'Hotel Booking API is running',
  };

  res.json(response);
});

// API version info
router.get('/version', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      version: process.env.npm_package_version || '1.0.0',
      apiVersion: 'v1',
      buildDate: new Date().toISOString(),
      features: [
        'Traditional hotel search',
        'AI-powered semantic search',
        'Booking management',
        'User authentication',
        'Vector similarity search',
        'OpenAPI documentation',
      ],
    },
    message: 'Hotel Booking API version information',
  };

  res.json(response);
});

// Mount route modules
router.use('/hotels', hotelRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);
router.use('/test', testRoutes);

export default router;
