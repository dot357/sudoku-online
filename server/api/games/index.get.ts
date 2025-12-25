import { defineEventHandler } from 'h3'
import { prisma } from '~~/server/db/prisma'
import { computeElapsedSec } from '~~/server/services/game/time'
import { calculateDigitCounts } from '~~/server/services/sudoku/digitCounts'



export default defineEventHandler(async (event) => {
  const sid = getOrCreateSid(event)

  const games = await prisma.game.findMany({
    where: { sid },
    orderBy: { createdAt: 'desc' },
    take: 50, // safety cap
  })

  const dtos: GamePublicStateDTO[] = games.map((g) => {
    const state = g.stateJson as unknown as GameState

    return {
      id: g.id,
      rank: state.rank,
      status: state.status,
      score: state.score,
      hintsUsed: state.hintsUsed,
      errors: state.errors,
      startedAt: state.startedAt,
      elapsedSec: computeElapsedSec(state),

      current: state.current,
      given: state.given,
      digitCounts: calculateDigitCounts(state.current),
    }
  })

  return { games: dtos }
})
