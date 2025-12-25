import { defineEventHandler, createError } from 'h3'
import { prisma } from '~~/server/db/prisma'
import { getOrCreateSid } from '~~/server/utils/session'
import type { CellValue,  GameState } from '~~/shared/types/sudoku'

import { pickRandomEmptyCellIndex } from '~~/server/services/game/pickEmptyCell'
import type { InputJsonValue } from '@prisma/client/runtime/client'
import { toPublicDTO } from '~~/server/utils/publicDTOs'

const MAX_HINTS = 10


export default defineEventHandler(async (event) => {
  const sid = getOrCreateSid(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing game id' })

  const game = await prisma.game.findUnique({ where: { id } })
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  if (game.sid !== sid) throw createError({ statusCode: 403, statusMessage: 'Not allowed' })

  const state = game.stateJson as unknown as GameState

  if (state.status === 'finished') {
    throw createError({ statusCode: 400, statusMessage: 'Game already finished' })
  }

  if (state.hintsUsed >= MAX_HINTS) {
    throw createError({ statusCode: 400, statusMessage: 'No hints remaining' })
  }

  const emptyIndex = pickRandomEmptyCellIndex(state.current)
  if (emptyIndex === null) {
    // Grid has no empty cells. Might be solved or wrong-filled; hint can't help.
    throw createError({ statusCode: 400, statusMessage: 'No empty cells available for hint' })
  }

  // Reveal correct value
  const value = state.solution[emptyIndex] as CellValue // 1..9
  state.current[(emptyIndex)] = value
  state.given[emptyIndex] = true

  // Penalty: -3, -4, -5...
  // hintsUsed is 0-based before increment.
  const penalty = -(3 + state.hintsUsed)
  state.score += penalty
  state.hintsUsed += 1

  await prisma.game.update({
    where: { id },
    data: {
      stateJson: (state as unknown as InputJsonValue),
      status: state.status,
    },
  })

  return {
    ...toPublicDTO(id, state),
    hint: {
      index: emptyIndex,
      value,
      penalty,
      hintsUsed: state.hintsUsed,
    },
  }
})
