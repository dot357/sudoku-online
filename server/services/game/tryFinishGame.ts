import type { GameState } from '~~/shared/types/sudoku'
import { computeElapsedSec } from './time';
import { calculateFinishBonus } from './score';

type FinishResult =
  | { finished: false }
  | { finished: true; bonus: number; elapsedSec: number }

/**
 * Checks if the game is fully solved and finishes it:
 * - status -> finished
 * - score += (500 - elapsedSec)
 *
 * Returns whether it finished and what bonus was applied.
 */
export function tryFinishGame(state: GameState, now = new Date()): FinishResult {
  if (state.status === 'finished') return { finished: false }

  // must be fully filled (no nulls)
  for (let i = 0; i < 81; i++) {
    if (state.current[i] === null) return { finished: false }
  }

  // must match solution exactly
  for (let i = 0; i < 81; i++) {
    if (state.current[i] !== state.solution[i]) return { finished: false }
  }

  const elapsedSec = computeElapsedSec(state, now)
  const bonus = calculateFinishBonus(elapsedSec)

  state.score += bonus
  state.status = 'finished'

  return { finished: true, bonus, elapsedSec }
}
