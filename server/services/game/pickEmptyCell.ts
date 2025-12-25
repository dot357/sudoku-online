import type { CellValue } from '~~/shared/types/sudoku'

export function pickRandomEmptyCellIndex(current: CellValue[]): number | null {
  const empties: number[] = []
  for (let i = 0; i < current.length; i++) {
    if (current[i] === null) empties.push(i)
  }

  if (empties.length === 0) return null

  const idx = Math.floor(Math.random() * empties.length)
  return empties[idx]
}
