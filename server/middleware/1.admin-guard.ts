import { isAuthed } from '../utils/auth'

const PROTECTED_PREFIXES = [
  '/api/sketches',
  '/api/auth/logout',
]

export default defineEventHandler((event) => {
  const url = event.path || ''
  const method = (event.method || 'GET').toUpperCase()

  // Public reads pass through
  if (method === 'GET' || method === 'HEAD') return

  if (!PROTECTED_PREFIXES.some(p => url.startsWith(p))) return

  if (!isAuthed(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
