import { checkPassword, issueSession } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event)
  const pw = body?.password || ''
  if (!checkPassword(pw)) {
    throw createError({ statusCode: 401, statusMessage: 'Wrong password' })
  }
  issueSession(event)
  return { ok: true }
})
