import type { ApiFn } from '~/app/requests/types'
import type { RecordsResponseDTO } from '~/shared/types/sudoku'

export async function fetchRecords(api: ApiFn): Promise<RecordsResponseDTO> {
  return api<RecordsResponseDTO>('/api/records')
}
