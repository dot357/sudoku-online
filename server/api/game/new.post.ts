import type { InputJsonValue } from '@prisma/client/runtime/client'
import { readBody, createError, defineEventHandler, type H3Event } from 'h3'
import { prisma } from '~~/server/db/prisma'
import { calculateDigitCounts } from '~~/server/services/sudoku/digitCounts'
import { generateSolution } from '~~/server/services/sudoku/generateSolution'
import { makePuzzle } from '~~/server/services/sudoku/makePuzzle'





const RANKS: Rank[] = ['beginner', 'intermediate', 'hard', 'expert']

export default defineEventHandler(async (event : H3Event) => {
  const sid = getOrCreateSid(event)
  const body = (await readBody(event).catch(() => ({}))) as Partial<NewGameRequestDTO>

  const rank = body.rank
  if (!rank || !RANKS.includes(rank)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid rank',
    })
  }

  // --- Generate Sudoku ---
  const solution = generateSolution()
  const { puzzle, given } = makePuzzle(solution, rank)

  const startedAt = new Date().toISOString()

  const state: GameState = {
    rank,
    status: 'in_progress',

    solution,
    puzzle,
    given,
    current: puzzle.slice(),

    score: 0,
    errors: 0,
    hintsUsed: 0,

    startedAt,
    pauseAccumulatedMs: 0,
    pausedAt: null,
  } 

  const game = await prisma.game.create({
    data: {
      sid,
      rank,
      status: 'in_progress',
      stateJson: (state as unknown as InputJsonValue),
    },
  })

  const dto: GamePublicStateDTO = {
    id: game.id,
    rank,
    status: 'in_progress',
    score: 0,
    hintsUsed: 0,
    errors: 0,
    startedAt,
    elapsedSec: 0,

    current: state.current,
    given: state.given,
    digitCounts: calculateDigitCounts(state.current),
  }

  return dto
})


/**
 * 
 * Example request
 * 
 * curl -X POST http://localhost:3000/api/game/new \
 * -H "content-type: application/json" \
 * -d '{"rank":"beginner"}' -i
 * 
 * Should see a cookie set with sid will help me to determine the user when game starts
 * or you can just use postman
 */