/** Emails with lifetime free access – never blocked by future billing. */
export const LIFETIME_ACCESS_EMAILS = [
  'rasmus.nilsson9931@gmail.com',
] as const

export function isLifetimeAccessEmail(email: string): boolean {
  return LIFETIME_ACCESS_EMAILS.includes(
    email.toLowerCase().trim() as (typeof LIFETIME_ACCESS_EMAILS)[number],
  )
}

export function getTokenExpiry(email: string): string {
  return isLifetimeAccessEmail(email) ? '3650d' : '7d'
}
