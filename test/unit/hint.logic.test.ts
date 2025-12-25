import { describe, it, expect } from 'vitest'
import { canUseHint, calculateHintPenalty, DEFAULT_MAX_HINTS } from '../../server/services/game/hint'

describe('hint logic', () => {
  it('allows hints up to the max and blocks at max', () => {
    expect(canUseHint(0)).toBe(true)
    expect(canUseHint(DEFAULT_MAX_HINTS - 1)).toBe(true)
    expect(canUseHint(DEFAULT_MAX_HINTS)).toBe(false)
  })

  it('applies increasing penalties as hints are used', () => {
    expect(calculateHintPenalty(0)).toBe(-3)
    expect(calculateHintPenalty(1)).toBe(-4)
    expect(calculateHintPenalty(2)).toBe(-5)
  })
})
