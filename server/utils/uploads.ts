import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const DIR = '.data/uploads'

export const UPLOAD_DIR = DIR

export function ensureDir() {
  mkdirSync(DIR, { recursive: true })
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export interface StoredImage {
  name: string
  width: number
  height: number
}

export async function processAndStore(
  id: string,
  buffer: ArrayBuffer | Buffer,
  mimeType: string,
): Promise<StoredImage> {
  const ext = MIME_TO_EXT[mimeType.toLowerCase()]
  if (!ext) throw createError({ statusCode: 400, statusMessage: `unsupported image type: ${mimeType}` })

  ensureDir()
  const outName = `${id}.${ext}`
  const outPath = join(DIR, outName)

  let pipeline = sharp(Buffer.from(buffer as ArrayBuffer))
    .rotate() // honor EXIF orientation, then strip below
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })

  if (ext === 'jpg') pipeline = pipeline.jpeg({ quality: 88, mozjpeg: true })
  else if (ext === 'png') pipeline = pipeline.png({ compressionLevel: 9 })
  else if (ext === 'webp') pipeline = pipeline.webp({ quality: 88 })
  else if (ext === 'avif') pipeline = pipeline.avif({ quality: 60 })

  const out = await pipeline.toBuffer()
  writeFileSync(outPath, out)

  // Re-read to get final dimensions (sharp's pipeline.metadata() reflects the
  // source, not the post-resize output, so probe the written buffer).
  const meta = await sharp(out).metadata()
  return {
    name: outName,
    width: meta.width || 0,
    height: meta.height || 0,
  }
}

export function deleteUpload(name: string | null | undefined) {
  if (!name) return
  const p = join(DIR, name)
  if (existsSync(p)) {
    try { unlinkSync(p) } catch { /* swallow */ }
  }
}
