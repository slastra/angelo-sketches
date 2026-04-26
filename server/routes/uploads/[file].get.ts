import { createReadStream, statSync, existsSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import { UPLOAD_DIR } from '~~/server/utils/uploads'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

export default defineEventHandler((event) => {
  const file = basename(getRouterParam(event, 'file') || '')
  if (!file) throw createError({ statusCode: 400 })

  const path = join(UPLOAD_DIR, file)
  if (!existsSync(path)) throw createError({ statusCode: 404 })

  const ext = extname(file).toLowerCase()
  const mime = MIME[ext] || 'application/octet-stream'
  const stat = statSync(path)

  setHeader(event, 'content-type', mime)
  setHeader(event, 'content-length', stat.size)
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  return sendStream(event, createReadStream(path))
})
