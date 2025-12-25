import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { getOrCreateSid } from '../../server/utils/session'

vi.mock('node:crypto', () => ({
  randomUUID: () => 'test-uuid',
}))

const getCookie = vi.fn()
const setCookie = vi.fn()

vi.mock('h3', () => ({
  getCookie: (...args: unknown[]) => getCookie(...args),
  setCookie: (...args: unknown[]) => setCookie(...args),
}))

describe('getOrCreateSid', () => {
  const event = {} as H3Event

  beforeEach(() => {
    getCookie.mockReset()
    setCookie.mockReset()
  })

  it('returns existing sid when cookie is present', () => {
    getCookie.mockReturnValue('existing-sid')

    const sid = getOrCreateSid(event)

    expect(sid).toBe('existing-sid')
    expect(setCookie).not.toHaveBeenCalled()
  })

  it('creates and sets sid when cookie is missing', () => {
    getCookie.mockReturnValue(undefined)

    const sid = getOrCreateSid(event)

    expect(sid).toBe('test-uuid')
    expect(setCookie).toHaveBeenCalledWith(event, 'sid', 'test-uuid', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  })
})
