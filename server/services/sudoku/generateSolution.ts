const SIZE = 9
const CELL_COUNT = SIZE * SIZE
const EMPTY = 0

type Grid = number[] // length 81, values 0..9

// public

export function generateSolution(): number[] {
  const grid = createEmptyGrid()
  const solved = fillGridWithBacktracking(grid)

  if (!solved) {
    throw new Error('Failed to generate sudoku solution')
  }

  return grid
}

// helpers

function createEmptyGrid(): Grid {
  return Array(CELL_COUNT).fill(EMPTY)
}

function findFirstEmptyCellIndex(grid: Grid): number {
  return grid.findIndex((v) => v === EMPTY) // returns -1 when full
}

function setCell(grid: Grid, index: number, value: number): void {
  grid[index] = value
}

function clearCell(grid: Grid, index: number): void {
  grid[index] = EMPTY
}

// Math

function rowOf(index: number): number {
  return Math.floor(index / SIZE)
}

function colOf(index: number): number {
  return index % SIZE
}

function boxStartRow(row: number): number {
  return Math.floor(row / 3) * 3
}

function boxStartCol(col: number): number {
  return Math.floor(col / 3) * 3
}

// constrainst

function getUsedNumbersInRow(grid: Grid, row: number): Set<number> {
  const used = new Set<number>()
  const start = row * SIZE

  for (let c = 0; c < SIZE; c++) {
    const v = grid[start + c]
    if (v !== EMPTY) used.add(v)
  }

  return used
}

function getUsedNumbersInCol(grid: Grid, col: number): Set<number> {
  const used = new Set<number>()

  for (let r = 0; r < SIZE; r++) {
    const v = grid[r * SIZE + col]
    if (v !== EMPTY) used.add(v)
  }

  return used
}

function getUsedNumbersInBox(grid: Grid, row: number, col: number): Set<number> {
  const used = new Set<number>()
  const r0 = boxStartRow(row)
  const c0 = boxStartCol(col)

  for (let r = r0; r < r0 + 3; r++) {
    for (let c = c0; c < c0 + 3; c++) {
      const v = grid[r * SIZE + c]
      if (v !== EMPTY) used.add(v)
    }
  }

  return used
}

function getUsedNumbersForCell(grid: Grid, index: number): Set<number> {
  const r = rowOf(index)
  const c = colOf(index)

  // Merge row/col/box constraints
  const used = new Set<number>()
  for (const n of getUsedNumbersInRow(grid, r)) used.add(n)
  for (const n of getUsedNumbersInCol(grid, c)) used.add(n)
  for (const n of getUsedNumbersInBox(grid, r, c)) used.add(n)

  return used
}

// generate candidates

function getCandidatesForCell(grid: Grid, index: number): number[] {
  const used = getUsedNumbersForCell(grid, index)
  const candidates: number[] = []

  for (let n = 1; n <= 9; n++) {
    if (!used.has(n)) candidates.push(n)
  }

  return shuffle(candidates) // randomized generation
}

// ---------- Backtracking solver ----------

function fillGridWithBacktracking(grid: Grid): boolean {
  const index = findFirstEmptyCellIndex(grid)
  if (index === -1) return true // no empties => solved

  const candidates = getCandidatesForCell(grid, index)

  for (const value of candidates) {
    setCell(grid, index, value)

    if (fillGridWithBacktracking(grid)) {
      return true
    }

    clearCell(grid, index)
  }

  return false
}

// util

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
