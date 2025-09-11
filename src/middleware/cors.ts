import cors from 'cors';
import { config } from '../config/env';

// CORS configuration
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests from frontend URL or no origin (for mobile apps)
    const allowedOrigins = [
      config.app.frontendUrl,
      'http://localhost:3001',
      'http://localhost:3000',
      'https://localhost:3001',
      'https://localhost:3000',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
