/**
 * Supabase Configuration
 * Load environment variables for Supabase connection
 */

export const supabaseConfig = {
  enabled: import.meta.env.VITE_SUPABASE_ENABLED === 'true',
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseConfig.url && supabaseConfig.anonKey);
};
