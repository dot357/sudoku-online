export type Rank = 'beginner' | 'intermediate' | 'hard' | 'expert'

export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null

export type GameStatus = 'in_progress' | 'finished'

export interface NewGameRequestDTO {
  rank: Rank
}

export interface MoveRequestDTO {
  index: number
  value: CellValue
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
  paused: boolean
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

export interface RecordDTO {
  id: string
  gameId: string
  rank: Rank
  score: number
  durationSec: number
  createdAt: string
}

export interface MoveDTO {
  index: number
  value: CellValue
  isCorrect: boolean | null
  deltaScore: number
}

export interface HintDTO {
  index: number
  value: number
  penalty: number
  hintsUsed: number
}

export interface FinishDTO {
  bonus: number
  elapsedSec: number
}

export type NewGameResponseDTO = GamePublicStateDTO

export interface GamesResponseDTO {
  games: GameSummaryDTO[]
}

export interface RecordsResponseDTO {
  records: RecordDTO[]
}

export interface MoveResponseDTO extends GamePublicStateDTO {
  move: MoveDTO
  finished?: FinishDTO | null
}

export interface HintResponseDTO extends GamePublicStateDTO {
  hint: HintDTO
  finished?: FinishDTO | null
}

export interface SolveResponseDTO extends GamePublicStateDTO {
  finished?: FinishDTO | null
  debug?: boolean
}
