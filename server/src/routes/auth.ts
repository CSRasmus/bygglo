import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { getTokenExpiry } from '../lib/accessWhitelist.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'projectManager' } = req.body
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password och name krävs' })
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'E-postadressen används redan' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name, role]
    )

    const user = result.rows[0]
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: getTokenExpiry(user.email) }
    )

    res.status(201).json({ token, user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email och password krävs' })
    }

    const result = await query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
      [email]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Felaktig e-post eller lösenord' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Felaktig e-post eller lösenord' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: getTokenExpiry(user.email) }
    )

    const { password_hash: _, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [req.userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Användare hittades inte' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Utloggad' })
})

export default router
