'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/dal';
import sharp from 'sharp';

// ─── Constants ───────────────────────────────────────────────────────────────

const BUCKET = 'photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];

// Target dimensions for compressed output
const PRODUCT_IMAGE_SIZE = { width: 800, height: 800 };
const AVATAR_IMAGE_SIZE  = { width: 400, height: 400 };

export type UploadResult =
  | { success: true; url: string; path: string }
  | { success: false; error: string };

// ─── Core Upload Helper ───────────────────────────────────────────────────────

async function uploadToStorage(
  buffer: Buffer,
  folder: string,
  filename: string,
  contentType: string = 'image/webp'
): Promise<UploadResult> {
  const supabase = createServiceClient();
  const path = `${folder}/${filename}`;

  // Try to upload the file
  let { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: '3600',
    });

  // If the bucket does not exist, Supabase returns a specific error.
  const errorMsg = error ? String(error.message || (error as any).error || '').toLowerCase() : '';
  if (errorMsg.includes('bucket') || errorMsg.includes('not found')) {
    console.log(`[upload] Bucket '${BUCKET}' not found. Attempting to create it...`);
    const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });

    if (bucketError && !String(bucketError.message || '').includes('already exists')) {
      console.error('[upload] Failed to create bucket:', bucketError);
      return { success: false, error: 'Storage setup failed. Please contact support.' };
    }

    // Wait briefly for bucket propagation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Retry upload after creating the bucket
    const retry = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType,
        upsert: true,
        cacheControl: '3600',
      });
    
    error = retry.error;
  }

  if (error) {
    console.error('[upload] Supabase storage error:', error);
    return { success: false, error: 'Failed to upload file. Please try again. Error: ' + error.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { success: true, url: data.publicUrl, path };
}

// ─── Registration Document / Valid ID Upload (Public) ─────────────────────────

/**
 * Upload a government/institutional ID or farm document during registration.
 * Does not require existing user session.
 */
export async function uploadRegistrationDocument(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided.' };

  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
    return { success: false, error: 'Only JPG, PNG, WebP images or PDF files are allowed.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File size must be 5 MB or less.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 9);

  if (file.type === 'application/pdf') {
    const filename = `doc_${timestamp}_${rand}.pdf`;
    return uploadToStorage(inputBuffer, 'verification-documents', filename, 'application/pdf');
  }

  // Compress image to high-quality legible WebP
  const compressed = await sharp(inputBuffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();

  const filename = `id_${timestamp}_${rand}.webp`;
  return uploadToStorage(compressed, 'verification-documents', filename, 'image/webp');
}

// ─── Refund Proof Upload ──────────────────────────────────────────────────────

/**
 * Upload proof photos for refund / return requests.
 */
export async function uploadRefundProof(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided.' };

  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
    return { success: false, error: 'Only JPG, PNG, WebP images or PDF files are allowed.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File size must be 5 MB or less.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 9);

  if (file.type === 'application/pdf') {
    const filename = `proof_${timestamp}_${rand}.pdf`;
    return uploadToStorage(inputBuffer, 'refund-proofs', filename, 'application/pdf');
  }

  const compressed = await sharp(inputBuffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const filename = `proof_${timestamp}_${rand}.webp`;
  return uploadToStorage(compressed, 'refund-proofs', filename, 'image/webp');
}

// ─── Product Image Upload ─────────────────────────────────────────────────────

/**
 * Upload a product image. Compresses to 800×800 WebP before upload.
 * Caller must be authenticated.
 */
export async function uploadProductImage(formData: FormData): Promise<UploadResult> {
  const user = await requireAuth();

  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided.' };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG, or WebP images are allowed.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Image must be smaller than 5 MB.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Compress: resize to max 800×800, convert to WebP (quality 80)
  const compressed = await sharp(inputBuffer)
    .resize(PRODUCT_IMAGE_SIZE.width, PRODUCT_IMAGE_SIZE.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  const timestamp = Date.now();
  const filename = `${timestamp}.webp`;
  const folder = `products/${user.id}`;

  return uploadToStorage(compressed, folder, filename);
}

// ─── Farm Cover Photo Upload ──────────────────────────────────────────────────

/**
 * Upload a farm cover photo. Compresses to 1200×600 WebP (banner ratio).
 * Caller must be an authenticated FARMER.
 */
export async function uploadFarmCoverPhoto(formData: FormData): Promise<UploadResult> {
  const user = await requireAuth();

  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided.' };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG, or WebP images are allowed.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Image must be smaller than 5 MB.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Banner-optimized compression: 1200×500 WebP
  const compressed = await sharp(inputBuffer)
    .resize(1200, 500, { fit: 'cover' })
    .webp({ quality: 82 })
    .toBuffer();

  const timestamp = Date.now();
  const filename = `cover_${timestamp}.webp`;
  const folder = `farms/${user.id}`;

  return uploadToStorage(compressed, folder, filename);
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────

/**
 * Upload a user avatar. Compresses to 400×400 WebP circle-safe square.
 */
export async function uploadAvatar(formData: FormData): Promise<UploadResult> {
  const user = await requireAuth();

  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No file provided.' };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG, or WebP images are allowed.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Image must be smaller than 5 MB.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const compressed = await sharp(inputBuffer)
    .resize(AVATAR_IMAGE_SIZE.width, AVATAR_IMAGE_SIZE.height, { fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer();

  const filename = `avatar.webp`;
  const folder = `avatars/${user.id}`;

  return uploadToStorage(compressed, folder, filename);
}

// ─── Delete Image ─────────────────────────────────────────────────────────────

/**
 * Delete an image from Supabase Storage by its storage path.
 * The caller must own the file (path contains their user ID).
 */
export async function deleteImage(storagePath: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();

  // Security: ensure the path belongs to this user
  if (!storagePath.includes(user.id)) {
    return { success: false, error: 'Unauthorized: cannot delete this file.' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);

  if (error) {
    return { success: false, error: 'Failed to delete image.' };
  }

  return { success: true };
}
