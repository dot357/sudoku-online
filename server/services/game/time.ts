import type { GameState } from "~~/shared/types/sudoku"

export function computeElapsedSec(state: GameState, now = new Date()): number {
  const started = new Date(state.startedAt).getTime()
  const pausedAt = state.pausedAt ? new Date(state.pausedAt).getTime() : null

  const pauseAccumulated = state.pauseAccumulatedMs ?? 0

  // If currently paused, elapsed time stops at pausedAt
  const end = pausedAt ?? now.getTime()

  const elapsedMs = Math.max(0, end - started - pauseAccumulated)
  return Math.floor(elapsedMs / 1000)
}
