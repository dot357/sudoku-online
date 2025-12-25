export type Rank = 'beginner' | 'intermediate' | 'hard' | 'expert'

export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null

export type GameStatus = 'in_progress' | 'finished'

export interface NewGameRequestDTO {
  rank: Rank
}

export interface GamePublicStateDTO {
  id: string
  rank: Rank
  status: GameStatus
  score: number
  hintsUsed: number
  startedAt: string // ISO
  elapsedSec: number
  // grid stuff later:
  // current: CellValue[]
  // given: boolean[]
  // digitCounts: number[]
}
