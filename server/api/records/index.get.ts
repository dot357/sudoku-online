import { defineEventHandler } from 'h3'
import { prisma } from '~~/server/db/prisma'

export default defineEventHandler(async () => {
  const records = await prisma.record.findMany({
    orderBy: [{ score: 'desc' }, { durationSec: 'asc' }],
    take: 3,
  })

  return { records }
})
