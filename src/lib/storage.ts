// Supabase Storage layer
// Uses the officialai-media bucket for all file storage
//
// Retry policy: All uploads get 3 retries with 1s exponential backoff.
// Downloads (downloadAndStore) also retry since they involve both a
// fetch from the source URL and an upload to Supabase.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { withStorageRetry } from "@/lib/pipeline/retry";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const BUCKET = "officialai-media";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function isStorageConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Upload a file buffer to Supabase Storage and return its public URL.
 * Includes retry logic: 3 retries with 1s exponential backoff.
 */
export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const { result: publicUrl } = await withStorageRetry(async () => {
    const client = getClient();

    const { error } = await client.storage
      .from(BUCKET)
      .upload(key, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // Return the public URL (bucket is public)
    const { data } = client.storage.from(BUCKET).getPublicUrl(key);
    return data.publicUrl;
  }, `upload-${key.substring(0, 50)}`);

  return publicUrl;
}

/**
 * Get the public URL for a stored file.
 */
export function getPublicUrl(key: string): string {
  const client = getClient();
  const { data } = client.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Generate a signed download URL valid for the given duration.
 */
export async function getSignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = getClient();
  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(key, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message}`);
  }
  return data.signedUrl;
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getClient();
  const { error } = await client.storage.from(BUCKET).remove([key]);
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Download a file from an external URL and upload it to storage.
 * Used for persisting AI-generated video/image results.
 */
export async function downloadAndStore(
  sourceUrl: string,
  key: string,
  contentType = "video/mp4"
): Promise<string> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download from ${sourceUrl}: ${response.status} ${response.statusText}`
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return uploadFile(buffer, key, contentType);
}

// ---------------------------------------------------------------------------
// Key helpers — organise objects by type and user
// ---------------------------------------------------------------------------

export function photoKey(userId: string, fileId: string, ext: string): string {
  return `photos/${userId}/${fileId}.${ext}`;
}

export function voiceKey(userId: string, fileId: string, ext: string): string {
  return `voices/${userId}/${fileId}.${ext}`;
}

export function videoKey(userId: string, fileId: string, ext: string): string {
  return `videos/${userId}/${fileId}.${ext}`;
}

export function audioKey(userId: string, fileId: string, ext: string): string {
  return `audio/${userId}/${fileId}.${ext}`;
}

export function thumbnailKey(userId: string, fileId: string, ext: string): string {
  return `thumbnails/${userId}/${fileId}.${ext}`;
}
