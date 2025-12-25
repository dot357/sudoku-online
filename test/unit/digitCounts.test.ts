import { describe, it, expect } from 'vitest'
import type { CellValue } from '../../shared/types/sudoku'
import { calculateDigitCounts } from '../../server/services/sudoku/digitCounts'

describe('calculateDigitCounts', () => {
  it('returns an array of length 10 (index 1..9 used)', () => {
    const grid: CellValue[] = Array(81).fill(null)
    const counts = calculateDigitCounts(grid)

    expect(counts).toHaveLength(10)
    expect(counts[0]).toBe(0)
  })

  it('ignores nulls and counts digits correctly', () => {
    const grid: CellValue[] = Array(81).fill(null)
    grid[0] = 1
    grid[1] = 1
    grid[2] = 9
    grid[3] = 5
    grid[4] = 5
    grid[5] = 5

    const counts = calculateDigitCounts(grid)

    expect(counts[1]).toBe(2)
    expect(counts[5]).toBe(3)
    expect(counts[9]).toBe(1)
    expect(counts[2]).toBe(0)
  })

  it('counts a full solved grid: each digit appears 9 times', () => {
    // 9x9 flat
    const solved: CellValue[] = [
      4,7,5,2,3,8,1,9,6,
      3,2,6,1,9,4,8,7,5,
      9,8,1,6,7,5,2,4,3,
      5,4,8,7,1,3,9,6,2,
      7,9,3,4,2,6,5,8,1,
      1,6,2,8,5,9,7,3,4,
      8,3,7,5,6,1,4,2,9,
      6,5,4,9,8,2,3,1,7,
      2,1,9,3,4,7,6,5,8,
    ]

    const counts = calculateDigitCounts(solved)

    for (let d = 1; d <= 9; d++) {
      expect(counts[d]).toBe(9)
    }
  })
})
