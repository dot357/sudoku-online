import { describe, it, expect } from 'vitest'
import type { GameState } from '../../shared/types/sudoku'
import { tryFinishGame } from '../../server/services/game/tryFinishGame'

function makeSolvedState(overrides: Partial<GameState> = {}): GameState {
  const solution = Array.from({ length: 81 }, (_, i) => (i % 9) + 1)
  const base: GameState = {
    rank: 'beginner',
    status: 'in_progress',
    solution,
    puzzle: solution.slice(),
    given: Array(81).fill(true),
    current: solution.slice(),
    score: 0,
    errors: 0,
    hintsUsed: 0,
    startedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
    pauseAccumulatedMs: 0,
    pausedAt: null,
  }

  return { ...base, ...overrides }
}

describe('tryFinishGame', () => {
  it('finishes a solved grid and adds a non-negative bonus', () => {
    const state = makeSolvedState()
    const now = new Date('2024-01-01T00:08:20.000Z') // 500s

    const result = tryFinishGame(state, now)

    expect(result.finished).toBe(true)
    if (result.finished) {
      expect(result.bonus).toBe(0)
      expect(result.elapsedSec).toBe(500)
    }
    expect(state.status).toBe('finished')
    expect(state.score).toBe(0)
  })

  it('does not finish when any cell is null', () => {
    const state = makeSolvedState()
    state.current[10] = null

    const result = tryFinishGame(state)

    expect(result.finished).toBe(false)
    expect(state.status).toBe('in_progress')
  })

  it('does not finish when any cell is incorrect', () => {
    const state = makeSolvedState()
    state.current[0] = 9

    const result = tryFinishGame(state)

    expect(result.finished).toBe(false)
    expect(state.status).toBe('in_progress')
  })
})
