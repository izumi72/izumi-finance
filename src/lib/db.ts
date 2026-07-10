import { PrismaClient } from '@prisma/client'

// File ini bekerja untuk SQLite, PostgreSQL, dan MySQL.
// Cukup ubah DATABASE_URL di .env — tidak perlu ubah kode ini.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db