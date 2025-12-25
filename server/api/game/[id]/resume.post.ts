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

  // idempotent: resuming when not paused is fine
  if (state.pausedAt !== null) {
    const pausedAtMs = new Date(state.pausedAt).getTime()
    const nowMs = Date.now()

    if (Number.isFinite(pausedAtMs) && nowMs >= pausedAtMs) {
      state.pauseAccumulatedMs = (state.pauseAccumulatedMs ?? 0) + (nowMs - pausedAtMs)
    }

    state.pausedAt = null

    await prisma.game.update({
      where: { id },
      data: {  
        stateJson: (state as unknown as InputJsonValue),
        status: state.status
    },
    })
  }

  return { ...toPublicDTO(id, state), paused: false }
})
