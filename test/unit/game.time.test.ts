import { describe, it, expect } from 'vitest'
import type { GameState } from '../../shared/types/sudoku'
import { computeElapsedSec } from '../../server/services/game/time'

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base: GameState = {
    rank: 'beginner',
    status: 'in_progress',
    solution: Array(81).fill(1),
    puzzle: Array(81).fill(null),
    given: Array(81).fill(false),
    current: Array(81).fill(null),
    score: 0,
    errors: 0,
    hintsUsed: 0,
    startedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
    pauseAccumulatedMs: 0,
    pausedAt: null,
  }

  return { ...base, ...overrides }
}

describe('computeElapsedSec', () => {
  it('uses pausedAt when the game is paused', () => {
    const state = makeState({
      pausedAt: new Date('2024-01-01T00:01:40.000Z').toISOString(),
    })

    const now = new Date('2024-01-01T00:03:20.000Z')
    const elapsed = computeElapsedSec(state, now)

    expect(elapsed).toBe(100)
  })

  it('subtracts accumulated pause time', () => {
    const state = makeState({
      pauseAccumulatedMs: 30_000,
    })

    const now = new Date('2024-01-01T00:01:00.000Z')
    const elapsed = computeElapsedSec(state, now)

    expect(elapsed).toBe(30)
  })
})
