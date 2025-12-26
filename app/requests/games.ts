import type { ApiFn } from '~/app/requests/types'
import type { GamesResponseDTO, NewGameRequestDTO, NewGameResponseDTO } from '~/shared/types/sudoku'

export async function fetchGames(api: ApiFn): Promise<GamesResponseDTO> {
  return api<GamesResponseDTO>('/api/games')
}

export async function createGame(api: ApiFn, body: NewGameRequestDTO): Promise<NewGameResponseDTO> {
  return api<NewGameResponseDTO>('/api/game/new', {
    method: 'POST',
    body,
  })
}
