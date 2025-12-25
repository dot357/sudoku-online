import { defineEventHandler, createError } from 'h3'
import { prisma } from '~~/server/db/prisma'
import { getOrCreateSid } from '~~/server/utils/session'
import type { GameState } from '~~/shared/types/sudoku'
import { toPublicDTO } from '~~/server/utils/publicDTOs'
import type { InputJsonValue } from '@prisma/client/runtime/client'

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

  // idempotent: pausing twice is fine
  if (state.pausedAt === null) {
    state.pausedAt = new Date().toISOString()

    await prisma.game.update({
      where: { id },
      data: { 
        stateJson: (state as unknown as InputJsonValue),
        status: state.status
     },
    })
  }

  return { ...toPublicDTO(id, state), paused: true }
})
