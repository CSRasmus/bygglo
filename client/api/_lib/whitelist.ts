/** Emails with lifetime free access – never blocked by future billing. */
export const LIFETIME_ACCESS_EMAILS = [
  'rasmus.nilsson9931@gmail.com',
] as const

export type LifetimeEmail = (typeof LIFETIME_ACCESS_EMAILS)[number]

export function isLifetimeAccessEmail(email: string): boolean {
  return LIFETIME_ACCESS_EMAILS.includes(email.toLowerCase().trim() as LifetimeEmail)
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}
