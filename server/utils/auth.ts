import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE = 'angelo_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function secret(): string {
  const s = useRuntimeConfig().sessionSecret
  if (!s) throw createError({ statusCode: 500, statusMessage: 'SESSION_SECRET not set' })
  return s
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex')
}

function constantEq(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export function issueSession(event: H3Event) {
  const payload = String(Date.now())
  const value = `${payload}.${sign(payload)}`
  setCookie(event, COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export function endSession(event: H3Event) {
  setCookie(event, COOKIE, '', { path: '/', maxAge: 0 })
}

export function isAuthed(event: H3Event): boolean {
  const raw = getCookie(event, COOKIE)
  if (!raw) return false
  const dot = raw.indexOf('.')
  if (dot < 0) return false
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  return constantEq(sig, sign(payload))
}

export function checkPassword(input: string): boolean {
  const expected = useRuntimeConfig().appPassword
  if (!expected) return false
  return constantEq(input, expected)
}
