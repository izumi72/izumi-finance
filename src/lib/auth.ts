import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret"

export interface SessionUser {
  id: string
  name: string
  email: string
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    },
    JWT_SECRET,
    { algorithm: "HS256" }
  )
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser & { iat: number; exp: number }
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("izumi-session")?.value

  if (!token) return null

  return verifyToken(token)
}