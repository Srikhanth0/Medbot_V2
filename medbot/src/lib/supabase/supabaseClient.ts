import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseSchema } from '@/types/database';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://cdexmpvolgnyqbeetbeb.supabase.co';

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_OoUaacvlPMxMnT1w0mfi4A_cyuaDZKA';

/**
 * Global Supabase Client instance
 */
export const supabase: SupabaseClient<DatabaseSchema> = createClient<DatabaseSchema>(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Creates an authenticated Supabase Client injecting the Clerk JWT token for Row-Level Security (RLS)
 */
export function getAuthenticatedSupabaseClient(clerkToken?: string): SupabaseClient<DatabaseSchema> {
  if (!clerkToken) return supabase;

  return createClient<DatabaseSchema>(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export default supabase;
