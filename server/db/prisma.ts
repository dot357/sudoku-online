
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import prismaPkg from "@prisma/client"
import fs from "node:fs"
import path from "node:path"

const { PrismaClient } = prismaPkg

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const datasourceUrl = process.env.DATABASE_URL ?? "file:./dev.db"

if (datasourceUrl.startsWith("file:/tmp/")) {
  const tmpDbPath = datasourceUrl.replace(/^file:/, "")
  if (!fs.existsSync(tmpDbPath)) {
    const bundledDbPath = path.resolve(process.cwd(), "dev.db")
    if (fs.existsSync(bundledDbPath)) {
      fs.copyFileSync(bundledDbPath, tmpDbPath)
    }
  }
}
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
