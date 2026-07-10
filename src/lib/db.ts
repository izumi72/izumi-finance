import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Jika env Turso ada → pakai adapter libSQL (production / Vercel)
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
  }

  // Development → pakai SQLite lokal
  return new PrismaClient({ log: ['query'] })
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db