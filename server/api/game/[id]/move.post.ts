import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '~~/server/db/prisma'
import { getOrCreateSid } from '~~/server/utils/session'
import type { CellValue, GameState } from '~~/shared/types/sudoku'
import { toPublicDTO } from '~~/server/utils/publicDTOs'
import { tryFinishGame } from '~~/server/services/game/tryFinishGame'

type MoveBody = {
  index: number
  value: CellValue
}

function assertIndex(index: number) {
  if (!Number.isInteger(index) || index < 0 || index > 80) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid index (0..80)' })
  }
}

function assertValue(value: unknown): asserts value is CellValue {
  if (value === null) return

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 9) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid value (1..9 or null)',
    })
  }
}

export default defineEventHandler(async (event) => {
  const sid = getOrCreateSid(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing game id' })

  const body = (await readBody(event)) as Partial<MoveBody>
  const { index, value } = body

  if (index === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Missing index' })
  }

  assertIndex(index)
  assertValue(value)

  const game = await prisma.game.findUnique({ where: { id } })
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  if (game.sid !== sid) throw createError({ statusCode: 403, statusMessage: 'Not allowed' })

  const state = game.stateJson as unknown as GameState

  if (state.pausedAt !== null) {
    throw createError({ statusCode: 400, statusMessage: 'Game is paused' })
  }


  if (state.status === 'finished') {
    throw createError({ statusCode: 400, statusMessage: 'Game already finished' })
  }

  if (state.given[index]) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot edit a given cell',
      data: { index, given: true },
    })
  }

  const prev = state.current[index]

  // Idempotent no-op
  if (value === prev) {
    return {
      ...toPublicDTO(id, state),
      move: { index, value, isCorrect: null, deltaScore: 0 },
    }
  }

  state.current[index] = value

  // score calc
  let deltaScore = 0
  let isCorrect: boolean | null = null

  if (value !== null) {
    const correct = state.solution[index] === value
    isCorrect = correct

    if (correct && prev === null) {
      deltaScore += 5
    }

    if (!correct) {
      deltaScore -= 1
      state.errors += 1
    }
  }

  state.score += deltaScore

  // check if finished?
  const finish = tryFinishGame(state)

 // persist state to db
  await prisma.game.update({
    where: { id },
    data: {
      stateJson: state,
      status: state.status,
    },
  })

  if (finish.finished) {
    await prisma.record
      .create({
        data: {
          gameId: (id as unknown as string),
          rank: state.rank,
          score: state.score,
          durationSec: finish.elapsedSec,
        },
      })
      .catch(() => {})
  }

  return {
    ...toPublicDTO(id, state),
    move: { index, value, isCorrect, deltaScore },
    finished: finish.finished
      ? { bonus: finish.bonus, elapsedSec: finish.elapsedSec }
      : null,
  }
})
