export const DEFAULT_MAX_HINTS = 10

export function canUseHint(hintsUsed: number, maxHints = DEFAULT_MAX_HINTS): boolean {
  return hintsUsed < maxHints
}

export function calculateHintPenalty(hintsUsed: number): number {
  return -(3 + hintsUsed)
}
