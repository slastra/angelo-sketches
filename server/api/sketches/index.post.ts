import { nanoid } from 'nanoid'
import { useDb, rowToSketch, type SketchRow } from '~~/server/utils/db'
import { processAndStore } from '~~/server/utils/uploads'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function todayParts() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const display = `${MONTHS[d.getMonth()]} ${dd}, ${yyyy}`
  return { iso: `${yyyy}-${mm}-${dd}`, display }
}

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${MONTHS[m - 1]} ${String(d).padStart(2, '0')}, ${y}`
}

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, statusMessage: 'no form data' })

  let imageBuf: Buffer | null = null
  let imageType = ''
  let dateIso: string | null = null
  const tags: string[] = []

  for (const part of form) {
    if (part.name === 'image' && part.data) {
      imageBuf = Buffer.from(part.data)
      imageType = part.type || 'image/jpeg'
    } else if (part.name === 'date') {
      dateIso = part.data.toString('utf8').trim() || null
    } else if (part.name === 'tags' || part.name === 'tags[]') {
      const v = part.data.toString('utf8').trim()
      if (v) tags.push(v)
    }
  }

  if (!imageBuf) throw createError({ statusCode: 400, statusMessage: 'image required' })

  const id = nanoid(10)
  const stored = await processAndStore(id, imageBuf, imageType)

  const parts = dateIso ? { iso: dateIso, display: isoToDisplay(dateIso) } : todayParts()

  const db = useDb()
  const next = db.query('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM sketches').get() as { next: number }

  db.run(
    'INSERT INTO sketches (id, date, date_iso, tags, image_path, position) VALUES (?, ?, ?, ?, ?, ?)',
    [id, parts.display, parts.iso, JSON.stringify(tags), stored, next.next],
  )

  const row = db.query('SELECT * FROM sketches WHERE id = ?').get(id) as SketchRow
  return rowToSketch(row)
})
