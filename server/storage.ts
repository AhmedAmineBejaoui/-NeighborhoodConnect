import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET!;
const SUPABASE_PUBLIC = String(process.env.SUPABASE_PUBLIC_BUCKET || 'true') === 'true';

if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_BUCKET) {
  throw new Error('Supabase Storage config manquante. Vérifie SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_BUCKET');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function uploadBuffer(key: string, buffer: Buffer, contentType?: string) {
  const { data, error } = await supabase
    .storage
    .from(SUPABASE_BUCKET)
    .upload(key, buffer, { upsert: true, contentType });

  if (error) throw error;
  return data; // { path, ... }
}

export function getPublicUrl(key: string) {
  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

export async function getSignedUrl(key: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase
    .storage
    .from(SUPABASE_BUCKET)
    .createSignedUrl(key, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}

export async function removeObject(key: string) {
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([key]);
  if (error) throw error;
}

export async function urlFor(key: string) {
  return SUPABASE_PUBLIC ? getPublicUrl(key) : getSignedUrl(key, 3600);
}
