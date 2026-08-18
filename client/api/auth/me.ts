import type { VercelRequest, VercelResponse } from '@vercel/node'

const USERS: Record<string, { id: string; email: string; name: string; role: string; lifetimeAccess?: boolean }> = {
  'lifetime-rasmus-token': {
    id: 'user-rasmus',
    email: 'rasmus.nilsson9931@gmail.com',
    name: 'Rasmus Nilsson',
    role: 'admin',
    lifetimeAccess: true,
  },
  'demo-admin-token': {
    id: 'user-admin',
    email: 'admin@bygglo.se',
    name: 'Admin Andersson',
    role: 'admin',
  },
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const user = USERS[token]

  if (!user) {
    return res.status(401).json({ error: 'Ej autentiserad' })
  }

  return res.status(200).json(user)
}
