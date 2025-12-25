export function calculateDigitCounts(grid: CellValue[]): number[] {
  const counts = Array(10).fill(0) 

  for (const v of grid) {
    if (v !== null) counts[v]++
  }

  return counts
}
