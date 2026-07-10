// ============================================================
//  FILE INI UNTUK TURSO SAJA
//
//  Cara pakai:
//  1. bun add @libsql/client @prisma/adapter-libsql
//  2. Rename file ini:  mv db.turso.ts db.ts
//     (atau copy isinya ke db.ts)
//  3. Set TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN di .env
// ============================================================

import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createTursoClient() {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })

  const adapter = new PrismaLibSQL(libsql)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db =
  globalForPrisma.prisma ??
  createTursoClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db