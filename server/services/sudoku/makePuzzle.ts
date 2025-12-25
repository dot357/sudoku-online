import { countVisibleCells } from './validate'

const CELL_COUNT = 81

type VisibleRange = { min: number; max: number }

const VISIBLE_CELL_RANGES: Record<Rank, VisibleRange> = {
  beginner: { min: 36, max: 40 },
  intermediate: { min: 32, max: 36 },
  hard: { min: 28, max: 32 },
  expert: { min: 24, max: 28 },
}

// Publlic

export function makePuzzle(
  solution: number[],
  rank: Rank,
): { puzzle: CellValue[]; given: boolean[]; targetVisible: number } {
  assertSolutionShape(solution)

  const targetVisible = pickTargetVisibleCells(rank)
  const puzzle = createPuzzleFromSolution(solution)

  removeCellsUntilTarget(puzzle, targetVisible)
  enforceTargetExactly(puzzle, targetVisible)

  const given = buildGivenMask(puzzle)

  return { puzzle, given, targetVisible }
}

// validation

function assertSolutionShape(solution: number[]): void {
  if (!Array.isArray(solution) || solution.length !== CELL_COUNT) {
    throw new Error(`Solution must have length ${CELL_COUNT}`)
  }
}

// difficulty

function pickTargetVisibleCells(rank: Rank): number {
  const range = VISIBLE_CELL_RANGES[rank]
  return randomInt(range.min, range.max)
}

// generation

function createPuzzleFromSolution(solution: number[]): CellValue[] {
  // start with a full grid and remove values to create blanks
  return solution.slice() as CellValue[]
}

function removeCellsUntilTarget(puzzle: CellValue[], targetVisible: number): void {
  // Remove cells in a random order until we’re at (or below) target.
  const removalOrder = shuffledIndices(CELL_COUNT)

  for (const index of removalOrder) {
    if (countVisibleCells(puzzle) <= targetVisible) break
    puzzle[index] = null
  }
}

function enforceTargetExactly(puzzle: CellValue[], targetVisible: number): void {
  // In rare cases, the loop above can stop slightly above target due to chance.
  // Keep removing random filled cells until we hit the exact target.
  while (countVisibleCells(puzzle) > targetVisible) {
    const index = randomInt(0, CELL_COUNT - 1)
    if (puzzle[index] !== null) puzzle[index] = null
  }
}

function buildGivenMask(puzzle: CellValue[]): boolean[] {
  return puzzle.map((v) => v !== null)
}

// util

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffledIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  return shuffle(indices)
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}