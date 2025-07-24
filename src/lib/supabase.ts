import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.includes('supabase.co') && !url.includes('placeholder');
  } catch {
    return false;
  }
};

// Use valid URL or fallback to prevent crash
const validUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://demo.supabase.co';
const validKey = supabaseAnonKey && supabaseAnonKey !== 'placeholder-key' ? supabaseAnonKey : 'demo-key';

export const supabase = createClient<Database>(
  validUrl,
  validKey
);

// Check if we're using placeholder values
export const isSupabaseConfigured = isValidUrl(supabaseUrl) && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-key' && 
  supabaseAnonKey !== 'demo-key';

// Helper functions for common operations
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  return data;
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};