import { useDb, type SketchRow } from '~~/server/utils/db'
import { deleteUpload } from '~~/server/utils/uploads'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400 })

  const db = useDb()
  const row = db.query('SELECT * FROM sketches WHERE id = ?').get(id) as SketchRow | undefined
  if (!row) throw createError({ statusCode: 404 })

  db.run('DELETE FROM sketches WHERE id = ?', [id])
  deleteUpload(row.image_path)

  return { ok: true }
})
