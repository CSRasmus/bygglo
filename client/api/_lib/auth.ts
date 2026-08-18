import { sign, verify } from 'jsonwebtoken'
import { isLifetimeAccessEmail, normalizeEmail } from './whitelist'

const JWT_SECRET = process.env.JWT_SECRET || 'byggos-production-secret-change-me'
export const WHITELIST_PASSWORD = process.env.WHITELIST_PASSWORD || 'Byggos2026!'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'projectManager' | 'subcontractor' | 'customer'
  lifetimeAccess?: boolean
}

export const USERS: AuthUser[] = [
  {
    id: 'user-rasmus',
    email: 'rasmus.nilsson9931@gmail.com',
    name: 'Rasmus Nilsson',
    role: 'admin',
    lifetimeAccess: true,
  },
  {
    id: 'user-admin',
    email: 'admin@bygglo.se',
    name: 'Admin Andersson',
    role: 'admin',
  },
]

export function verifyPassword(email: string, password: string): boolean {
  const normalized = normalizeEmail(email)

  if (isLifetimeAccessEmail(normalized)) {
    return password === WHITELIST_PASSWORD
  }

  if (normalized === 'admin@bygglo.se' && password === 'demo1234') return true
  return false
}

export function findUser(email: string): AuthUser | undefined {
  return USERS.find(u => normalizeEmail(u.email) === normalizeEmail(email))
}

export function signToken(user: AuthUser): string {
  const isLifetime = user.lifetimeAccess || isLifetimeAccessEmail(user.email)
  const expiresIn = isLifetime ? '3650d' : '30d'
  return sign(
    { id: user.id, email: user.email, role: user.role, lifetimeAccess: isLifetime },
    JWT_SECRET,
    { expiresIn },
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = verify(token, JWT_SECRET) as AuthUser
    return findUser(payload.email) || null
  } catch {
    return null
  }
}

export function getUserFromHeader(authHeader?: string): AuthUser | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyToken(authHeader.slice(7))
}
