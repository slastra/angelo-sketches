import { useDb, rowToSketch, type SketchRow } from '~~/server/utils/db'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${MONTHS[m - 1]} ${String(d).padStart(2, '0')}, ${y}`
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400 })
  const body = await readBody<{ date?: string, tags?: string[], pinned?: boolean }>(event)

  const db = useDb()
  const existing = db.query('SELECT * FROM sketches WHERE id = ?').get(id) as SketchRow | undefined
  if (!existing) throw createError({ statusCode: 404 })

  const updates: string[] = []
  const params: (string | number | null)[] = []

  if (typeof body.date === 'string' && body.date) {
    updates.push('date_iso = ?', 'date = ?')
    params.push(body.date, isoToDisplay(body.date))
  }
  if (Array.isArray(body.tags)) {
    updates.push('tags = ?')
    params.push(JSON.stringify(body.tags.filter(Boolean)))
  }
  if (typeof body.pinned === 'boolean') {
    updates.push('pinned = ?')
    params.push(body.pinned ? 1 : 0)
  }

  if (updates.length === 0) return rowToSketch(existing)

  params.push(id)
  db.run(`UPDATE sketches SET ${updates.join(', ')} WHERE id = ?`, params)

  const row = db.query('SELECT * FROM sketches WHERE id = ?').get(id) as SketchRow
  return rowToSketch(row)
})
