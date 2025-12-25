import { defineEventHandler, createError } from 'h3'
import { prisma } from '~~/server/db/prisma'
import { getOrCreateSid } from '~~/server/utils/session'
import type { CellValue, GameState } from '~~/shared/types/sudoku'
import { toPublicDTO } from '~~/server/utils/publicDTOs'
import { tryFinishGame } from '~~/server/services/game/tryFinishGame'
import type { InputJsonValue } from '@prisma/client/runtime/client'

export default defineEventHandler(async (event) => {
  // Wont work in prod gives me easy solution
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not found',
    })
  }

  const sid = getOrCreateSid(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing game id' })

  const game = await prisma.game.findUnique({ where: { id } })
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  if (game.sid !== sid) throw createError({ statusCode: 403, statusMessage: 'Not allowed' })

  const state = game.stateJson as unknown as GameState

  if (state.status === 'finished') {
    return {
      ...toPublicDTO(id, state),
      finished: true,
      debug: true,
    }
  }

  // 🔧 Force-solve the board
  state.current = state.solution.slice() as CellValue[]
  state.given = state.given.map(() => true)

  const finish = tryFinishGame(state)

  await prisma.game.update({
    where: { id },
    data: {
      stateJson: (state as unknown as InputJsonValue),
      status: state.status,
    },
  })

  if (finish.finished) {
    await prisma.record
      .create({
        data: {
          gameId: id,
          rank: state.rank,
          score: state.score,
          durationSec: finish.elapsedSec,
        },
      })
      .catch(() => {})
  }

  return {
    ...toPublicDTO(id, state),
    finished: finish.finished
      ? { bonus: finish.bonus, elapsedSec: finish.elapsedSec }
      : null,
    debug: true,
  }
})
