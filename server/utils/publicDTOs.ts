import { computeElapsedSec } from "../services/game/time";
import { calculateDigitCounts } from "../services/sudoku/digitCounts";

export function toPublicDTO(id: string, state: GameState): GamePublicStateDTO {
  return {
    id,
    rank: state.rank,
    status: state.status,
    paused: state.pausedAt !== null,
    score: state.score,
    hintsUsed: state.hintsUsed,
    errors: state.errors,
    startedAt: state.startedAt,
    elapsedSec: computeElapsedSec(state),
    current: state.current,
    given: state.given,
    digitCounts: calculateDigitCounts(state.current),
  }
}
