import type { VercelRequest, VercelResponse } from '@vercel/node'

const RASMUS = {
  id: 'user-rasmus',
  email: 'rasmus.nilsson9931@gmail.com',
  name: 'Rasmus Nilsson',
  role: 'admin',
  lifetimeAccess: true,
}

const ADMIN = {
  id: 'user-admin',
  email: 'admin@bygglo.se',
  name: 'Admin Andersson',
  role: 'admin',
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const email = String(req.body?.email || '').toLowerCase().trim()
  const password = String(req.body?.password || '')

  if (email === 'rasmus.nilsson9931@gmail.com' && password === 'Byggos2026!') {
    return res.status(200).json({
      token: 'lifetime-rasmus-token',
      user: RASMUS,
    })
  }

  if (email === 'admin@bygglo.se' && password === 'demo1234') {
    return res.status(200).json({
      token: 'demo-admin-token',
      user: ADMIN,
    })
  }

  return res.status(401).json({ error: 'Felaktig e-post eller lösenord' })
}
