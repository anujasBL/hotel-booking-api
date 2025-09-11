import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variables validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Supabase configuration
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  
  // Google Gemini configuration
  GOOGLE_GEMINI_API_KEY: z.string().min(1, 'Google Gemini API key is required'),
  
  // JWT configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  
  // CORS configuration
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),
  
  // Logging configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate environment variables
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error('❌ Environment validation failed:');
  console.error(envValidation.error.format());
  process.exit(1);
}

const env = envValidation.data;

export const config = {
  app: {
    port: env.PORT,
    env: env.NODE_ENV,
    frontendUrl: env.FRONTEND_URL,
  },
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  gemini: {
    apiKey: env.GOOGLE_GEMINI_API_KEY,
  },
  jwt: {
    secret: env.JWT_SECRET,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;

export default config;
