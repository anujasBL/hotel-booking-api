import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Initialize Supabase client with service role for admin operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

// Initialize Supabase client with anon key for user operations
export const supabaseAnon = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

export default supabase;
