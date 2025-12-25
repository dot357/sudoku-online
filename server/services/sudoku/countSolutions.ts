const SIZE = 9
const EMPTY = 0

type Grid = number[] 

/**
 * Counts how many valid solutions a Sudoku grid has.
 * Stops early once the limit is reached (default: 2).
 */
export function countSolutions(grid: Grid, limit = 2): number {
  let solutionsFound = 0

  search(grid)

  return solutionsFound

  function search(current: Grid): void {
    if (solutionsFound >= limit) return

    const emptyIndex = findFirstEmptyCell(current)

    // No empty cells means one complete solution
    if (emptyIndex === -1) {
      solutionsFound++
      return
    }

    const candidates = getValidCandidates(current, emptyIndex)

    for (const value of candidates) {
      current[emptyIndex] = value
      search(current)
      current[emptyIndex] = EMPTY

      if (solutionsFound >= limit) return
    }
  }
}

// util

function findFirstEmptyCell(grid: Grid): number {
  return grid.findIndex((v) => v === EMPTY)
}

function getValidCandidates(grid: Grid, index: number): number[] {
  const used = new Set<number>()

  const row = Math.floor(index / SIZE)
  const col = index % SIZE

  // row + column
  for (let i = 0; i < SIZE; i++) {
    used.add(grid[row * SIZE + i])
    used.add(grid[i * SIZE + col])
  }

  // 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3

  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      used.add(grid[r * SIZE + c])
    }
  }

  const candidates: number[] = []
  for (let n = 1; n <= 9; n++) {
    if (!used.has(n)) candidates.push(n)
  }

  return candidates
}
