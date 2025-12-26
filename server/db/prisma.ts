
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import prismaPkg from "@prisma/client"

const { PrismaClient } = prismaPkg

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const datasourceUrl = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaBetterSqlite3({ url: datasourceUrl })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
