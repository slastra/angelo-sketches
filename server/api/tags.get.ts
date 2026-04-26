import { useDb } from '~~/server/utils/db'

export default defineEventHandler(() => {
  const db = useDb()
  const rows = db.query('SELECT tags FROM sketches').all() as { tags: string }[]
  const counts = new Map<string, number>()
  for (const r of rows) {
    let arr: string[] = []
    try { arr = JSON.parse(r.tags) } catch { /* skip bad row */ }
    for (const t of arr) counts.set(t, (counts.get(t) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
})
