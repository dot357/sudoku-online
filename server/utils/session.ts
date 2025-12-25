import { randomUUID } from 'node:crypto'
import { getCookie, setCookie, type H3Event } from 'h3'


const COOKIE_NAME = 'sid'

export function getOrCreateSid(event: H3Event): string {
  const existing = getCookie(event, COOKIE_NAME)
  if (existing) return existing

  const sid = randomUUID()

  // HTTP-only so JS can’t read it. SameSite Lax is good default for take-home.
  setCookie(event, COOKIE_NAME, sid, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // secure: true, // enable when running behind https
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return sid
}
