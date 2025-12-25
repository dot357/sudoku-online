export type Rank = 'beginner' | 'intermediate' | 'hard' | 'expert'

export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null

export type GameStatus = 'in_progress' | 'finished'

export interface NewGameRequestDTO {
  rank: Rank
}


export type Grid81<T> = T[] 

export interface GameState {
  rank: Rank
  status: GameStatus

  // authoritative truth
  solution: number[] // 81 ints 1..9 (Server Only)
  puzzle: CellValue[] // 81 with nulls
  given: boolean[] // 81
  current: CellValue[] // 81 (what user filled)

  score: number
  errors: number
  hintsUsed: number

  startedAt: string
  pauseAccumulatedMs: number
  pausedAt: string | null
}

export interface GamePublicStateDTO {
  id: string
  rank: Rank
  status: GameStatus
  score: number
  hintsUsed: number
  startedAt: string
  elapsedSec: number

  current: CellValue[]
  given: boolean[]
  digitCounts: number[] // 10 || 9
  errors: number
}


export interface GameSummaryDTO {
  id: string
  rank: Rank
  status: GameStatus
  score: number
  elapsedSec: number
  startedAt: string
  hintsUsed: number
  errors: number
  paused: boolean
}