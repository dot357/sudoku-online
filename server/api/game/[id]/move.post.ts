import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '~~/server/db/prisma'
import { getOrCreateSid } from '~~/server/utils/session'
import type { CellValue, GamePublicStateDTO, GameState } from '~~/shared/types/sudoku'
import { calculateDigitCounts } from '~~/server/services/sudoku/digitCounts'
import { computeElapsedSec } from '~~/server/services/game/time'
import type { InputJsonValue } from '@prisma/client/runtime/wasm-compiler-edge'
import { toPublicDTO } from '~~/server/utils/publicDTOs'

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
  if (value === null) {
    return
  }

//   Type guard
  if(typeof value !== 'number') {
    return
  }


  if (!Number.isInteger(value) || value < 1 || value > 9) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid value (1..9 or null)' })
  }
}

export default defineEventHandler(async (event) => {
  const sid = getOrCreateSid(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing game id' })

  const body = (await readBody(event)) as Partial<MoveBody>
  const index = body.index
  const value = body.value

  if (index === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Missing index' })
  }
  assertIndex(index)
  assertValue(value)

  const game = await prisma.game.findUnique({ where: { id } })
  if (!game) throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  if (game.sid !== sid) throw createError({ statusCode: 403, statusMessage: 'Not allowed' })

  const state = game.stateJson as unknown as GameState

  if (state.status === 'finished') {
    throw createError({ statusCode: 400, statusMessage: 'Game already finished' })
  }

  if (state.given[index]) {
    throw createError({
        statusCode : 400,
        statusMessage : 'Cannot edit a given cell',
        data : {
            index,
            given : true
        }
    })
  }

  const prev = state.current[index]

  if (value === prev) {
    return {
      ...toPublicDTO(id, state),
      move : {
        index,
        value,
        isCorrect : null,
        deltaScore : 0
      }
    }
  }

  state.current[index] = value


  // Scoring logic (per spec)
  let deltaScore = 0
  let isCorrect: boolean | null = null

  if (value === null) {
    // clearing a cell doesn't score
    isCorrect = null
  } else {
    const correct = state.solution[index] === value
    isCorrect = correct

    if (correct) {
      // Only award +5 if they just filled it correctly from empty
      if (prev === null) {
        deltaScore += 5
      }
    } else {
      deltaScore -= 1
      state.errors += 1
    }
  }

  state.score += deltaScore

  // Save updated state
  await prisma.game.update({
    where: { id },
    data: {
      stateJson: (state as unknown as InputJsonValue),
      status: state.status, // still in_progress for now
    },
  })

  const dto: GamePublicStateDTO = {
    id,
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

  return {
    ...dto,
    move: {
      index,
      value,
      isCorrect,
      deltaScore,
    },
  }
})



