import { writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import sharp from 'sharp'
import { useDb, rowToSketch, type SketchRow } from '~~/server/utils/db'
import { UPLOAD_DIR } from '~~/server/utils/uploads'

// Accepts the cropper's final canvas as a multipart blob and overwrites the
// stored file. Re-encodes via sharp to keep size sane and strip any metadata.

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400 })

  const db = useDb()
  const row = db.query('SELECT * FROM sketches WHERE id = ?').get(id) as SketchRow | undefined
  if (!row || !row.image_path) throw createError({ statusCode: 404 })

  const form = await readMultipartFormData(event)
  const blob = form?.find(p => p.name === 'image')
  if (!blob?.data) throw createError({ statusCode: 400, statusMessage: 'image required' })

  const ext = extname(row.image_path).toLowerCase().slice(1)
  let pipeline = sharp(Buffer.from(blob.data))
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })

  if (ext === 'jpg' || ext === 'jpeg') pipeline = pipeline.jpeg({ quality: 88, mozjpeg: true })
  else if (ext === 'png') pipeline = pipeline.png({ compressionLevel: 9 })
  else if (ext === 'webp') pipeline = pipeline.webp({ quality: 88 })
  else if (ext === 'avif') pipeline = pipeline.avif({ quality: 60 })

  const out = await pipeline.toBuffer()
  writeFileSync(join(UPLOAD_DIR, row.image_path), out)

  db.run('UPDATE sketches SET version = version + 1 WHERE id = ?', [id])
  const updated = db.query('SELECT * FROM sketches WHERE id = ?').get(id) as SketchRow
  return rowToSketch(updated)
})
