import { defineEventHandler, createError } from 'h3'
import { prisma } from '~~/server/db/prisma'
import { computeElapsedSec } from '~~/server/services/game/time'
import { calculateDigitCounts } from '~~/server/services/sudoku/digitCounts'
import type { GameState, GamePublicStateDTO } from '~~/shared/types/sudoku'




export default defineEventHandler(async (event) => {
  const sid = getOrCreateSid(event) // ensures cookie exists
  const id = event.context.params?.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing game id' })
  }

  const game = await prisma.game.findUnique({ where: { id } })

  if (!game) {
    throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  }

  // Ownership check (very important)
  if (game.sid !== sid) {
    throw createError({ statusCode: 403, statusMessage: 'Not allowed' })
  }

  const state = game.stateJson as unknown as GameState

  const dto: GamePublicStateDTO = {
    id: game.id,
    rank: state.rank,
    status: state.status,
    paused: state.pausedAt !== null,
    score: state.score,
    hintsUsed: state.hintsUsed,
    errors: state.errors,
    startedAt: state.startedAt,
    elapsedSec: computeElapsedSec(state),

    current: state.current,
    given: state.given,
    digitCounts: calculateDigitCounts(state.current),
  }

  return dto
})
