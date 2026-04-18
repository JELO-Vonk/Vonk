import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function sanitizeBaseName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 60) || 'upload';
}

function extensionFor(file: File) {
  const raw = file.name.split('.').pop()?.toLowerCase();
  if (raw && ['jpg', 'jpeg', 'png', 'webp'].includes(raw)) return raw;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

export function assertAllowedImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Alleen JPG, PNG en WEBP zijn toegestaan.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Bestand is te groot. Maximaal 5 MB.');
  }
}

export async function saveUploadedImage(file: File, folder = 'profiles') {
  assertAllowedImageFile(file);
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extensionFor(file);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${sanitizeBaseName(file.name)}.${ext}`;
  const relativeDir = path.join('uploads', folder);
  const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, fileName), bytes);
  return `/${relativeDir.replace(/\\/g, '/')}/${fileName}`;
}
