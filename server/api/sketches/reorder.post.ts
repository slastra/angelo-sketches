import { useDb } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ ids: string[] }>(event)
  if (!body || !Array.isArray(body.ids)) throw createError({ statusCode: 400 })

  const db = useDb()
  const upd = db.prepare('UPDATE sketches SET position = ? WHERE id = ?')
  const tx = db.transaction((ids: string[]) => {
    ids.forEach((id, i) => upd.run(i, id))
  })
  tx(body.ids)

  return { ok: true }
})
