const DEFAULT_MAX_BONUS = 500

export function calculateFinishBonus(
  elapsedSec: number,
  maxBonus = DEFAULT_MAX_BONUS,
): number {
  return Math.max(0, maxBonus - elapsedSec)
}
