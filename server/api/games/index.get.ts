import { defineEventHandler } from 'h3'
import { prisma } from '~~/server/db/prisma'
import { getOrCreateSid } from '~~/server/utils/session'
import type { GameState, GameSummaryDTO } from '~~/shared/types/sudoku'
import { computeElapsedSec } from '~~/server/services/game/time'

export default defineEventHandler(async (event) => {
  const sid = getOrCreateSid(event)

  const games = await prisma.game.findMany({
    where: { sid },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const summaries: GameSummaryDTO[] = games.map((g) => {
    const state = g.stateJson as unknown as GameState

    return {
      id: g.id,
      rank: state.rank,
      status: state.status,
      score: state.score,
      elapsedSec: computeElapsedSec(state),
      startedAt: state.startedAt,
      hintsUsed: state.hintsUsed,
      errors: state.errors,
      paused: state.pausedAt !== null,
    }
  })

  return { games: summaries }
})
