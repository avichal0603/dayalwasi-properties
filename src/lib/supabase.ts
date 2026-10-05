// ============================================
// Dayalwasi Properties — Supabase Client
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Image helpers ---

export function getImageUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('property-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(file: File, propertyId: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('property-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  return fileName;
}

export async function deleteImage(path: string): Promise<boolean> {
  const { error } = await supabase.storage.from('property-images').remove([path]);
  if (error) {
    console.error('Delete error:', error);
    return false;
  }
  return true;
}
