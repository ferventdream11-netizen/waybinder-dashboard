import { createClient } from '@supabase/supabase-js';

// These come from .env.local (and later from Vercel Project Settings)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }, // no browser auth yet
});
