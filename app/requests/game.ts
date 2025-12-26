import type { ApiFn } from '~/app/requests/types'
import type {
  GamePublicStateDTO,
  MoveRequestDTO,
  MoveResponseDTO,
  HintResponseDTO,
  SolveResponseDTO,
} from '~/shared/types/sudoku'

export async function fetchGame(api: ApiFn, id: string): Promise<GamePublicStateDTO> {
  return api<GamePublicStateDTO>(`/api/game/${id}`)
}

export async function sendMove(api: ApiFn, id: string, body: MoveRequestDTO): Promise<MoveResponseDTO> {
  return api<MoveResponseDTO>(`/api/game/${id}/move`, {
    method: 'POST',
    body,
  })
}

export async function requestHint(api: ApiFn, id: string): Promise<HintResponseDTO> {
  return api<HintResponseDTO>(`/api/game/${id}/hint`, { method: 'POST' })
}

export async function pauseGame(api: ApiFn, id: string): Promise<GamePublicStateDTO> {
  return api<GamePublicStateDTO>(`/api/game/${id}/pause`, { method: 'POST' })
}

export async function resumeGame(api: ApiFn, id: string): Promise<GamePublicStateDTO> {
  return api<GamePublicStateDTO>(`/api/game/${id}/resume`, { method: 'POST' })
}

export async function debugSolveGame(api: ApiFn, id: string): Promise<SolveResponseDTO> {
  return api<SolveResponseDTO>(`/api/game/${id}/solve`, { method: 'POST' })
}
