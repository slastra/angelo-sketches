import { useDb, rowToSketch, type SketchRow } from '~~/server/utils/db'

export default defineEventHandler(() => {
  const db = useDb()
  const rows = db
    .query('SELECT * FROM sketches ORDER BY pinned DESC, position ASC')
    .all() as SketchRow[]
  return rows.map(rowToSketch)
})
