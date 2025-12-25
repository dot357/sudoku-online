import { readBody } from 'h3'
import { prisma } from '~~/server/db/prisma'


const RANKS: Rank[] = ['beginner', 'intermediate', 'hard', 'expert']

export default defineEventHandler(async (event) => {
  const sid = getOrCreateSid(event)
  const body = (await readBody(event).catch(() => ({}))) as Partial<NewGameRequestDTO>

  const rank = body.rank
  if (!rank || !RANKS.includes(rank)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid rank',
      data: { allowed: RANKS },
    })
  }

  // TODO: Place holder state, MAKE SURE IMPLEMENT LATER
  const startedAt = new Date()
  const stateJson = {
    score: 0,
    hintsUsed: 0,
    startedAt: startedAt.toISOString(),
    // *: solution, puzzle, given, current, etc.
  }

  const game = await prisma.game.create({
    data: {
      sid,
      rank,
      status: 'in_progress',
      stateJson,
    },
  })

  const dto: GamePublicStateDTO = {
    id: game.id,
    rank,
    status: 'in_progress',
    score: 0,
    hintsUsed: 0,
    startedAt: startedAt.toISOString(),
    elapsedSec: 0,
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