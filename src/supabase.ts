import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Fallback for development if URL is missing but project ref might be in the key
// Supabase keys often follow the format sb_publishable_[ref]_...
const derivedUrl = !supabaseUrl && supabaseAnonKey.startsWith('sb_publishable_') 
  ? `https://${supabaseAnonKey.split('_')[2]}.supabase.co` 
  : supabaseUrl;

if (!derivedUrl || !supabaseAnonKey) {
  console.error('Supabase URL (VITE_SUPABASE_URL) and Anon Key (VITE_SUPABASE_ANON_KEY) are required for the application to function.');
}

export const supabase = createClient(derivedUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
