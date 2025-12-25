export function isValidGroup(nums: number[]): boolean {
  // expects 9 numbers 1..9
  const seen = new Set<number>()
  for (const n of nums) {
    if (n < 1 || n > 9) return false
    if (seen.has(n)) return false
    seen.add(n)
  }
  return seen.size === 9
}

export function validateSolutionGrid(grid: number[]): boolean {
  if (!Array.isArray(grid) || grid.length !== 81) return false

  // rows
  for (let r = 0; r < 9; r++) {
    const row = grid.slice(r * 9, r * 9 + 9)
    if (!isValidGroup(row)) return false
  }

  // cols
  for (let c = 0; c < 9; c++) {
    const col: number[] = []
    for (let r = 0; r < 9; r++) col.push(grid[r * 9 + c])
    if (!isValidGroup(col)) return false
  }

  // boxes
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const box: number[] = []
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const rr = br * 3 + r
          const cc = bc * 3 + c
          box.push(grid[rr * 9 + cc])
        }
      }
      if (!isValidGroup(box)) return false
    }
  }

  return true
}

export function countVisibleCells(puzzle: Array<number | null>): number {
    // Since if null i set it up as 0 or 1
  return puzzle.reduce((acc, v) => (acc as number) + (v === null ? 0 : 1), 0) as number
}