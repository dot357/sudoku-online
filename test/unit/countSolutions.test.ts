import { describe, it, expect } from 'vitest'
import { countSolutions } from '../../server/services/sudoku/countSolutions'

const solvedGrid: number[] = [
  4, 7, 5, 2, 3, 8, 1, 9, 6,
  3, 2, 6, 1, 9, 4, 8, 7, 5,
  9, 8, 1, 6, 7, 5, 2, 4, 3,
  5, 4, 8, 7, 1, 3, 9, 6, 2,
  7, 9, 3, 4, 2, 6, 5, 8, 1,
  1, 6, 2, 8, 5, 9, 7, 3, 4,
  8, 3, 7, 5, 6, 1, 4, 2, 9,
  6, 5, 4, 9, 8, 2, 3, 1, 7,
  2, 1, 9, 3, 4, 7, 6, 5, 8,
]

describe('countSolutions', () => {
  it('returns 1 for a solved valid grid', () => {
    const solutions = countSolutions(solvedGrid.slice())
    expect(solutions).toBe(1)
  })

  it('stops early at the provided limit', () => {
    const emptyGrid = Array(81).fill(0)
    const solutions = countSolutions(emptyGrid, 2)
    expect(solutions).toBe(2)
  })

  it('respects a lower limit for ambiguous grids', () => {
    const emptyGrid = Array(81).fill(0)
    const solutions = countSolutions(emptyGrid, 1)
    expect(solutions).toBe(1)
  })
})
