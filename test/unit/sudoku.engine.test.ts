import { describe, it, expect } from 'vitest'
import { generateSolution } from '../../server/services/sudoku/generateSolution'
import { validateSolutionGrid, countVisibleCells } from '../../server/services/sudoku/validate'
import { makePuzzle } from '../../server/services/sudoku/makePuzzle'

describe('sudoku engine', () => {
  it('generates a valid solved grid', () => {
    const sol = generateSolution()
    expect(sol).toHaveLength(81)
    expect(validateSolutionGrid(sol)).toBe(true)
  })

  it('creates a beginner puzzle with visible cells in range', () => {
    const sol = generateSolution()
    const { puzzle, given } = makePuzzle(sol, 'beginner')

    expect(puzzle).toHaveLength(81)
    expect(given).toHaveLength(81)

    const visible = countVisibleCells(puzzle)
    expect(visible).toBeGreaterThanOrEqual(36)
    expect(visible).toBeLessThanOrEqual(40)
  })
})
