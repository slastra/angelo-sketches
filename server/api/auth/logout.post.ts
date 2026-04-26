import { endSession } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  endSession(event)
  return { ok: true }
})
