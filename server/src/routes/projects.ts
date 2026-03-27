import { Router } from 'express'
import { query } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/projects
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT p.* FROM projects p
       JOIN user_projects up ON up.project_id = p.id
       WHERE up.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.userId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

// GET /api/projects/:id
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT p.* FROM projects p
       JOIN user_projects up ON up.project_id = p.id
       WHERE p.id = $1 AND up.user_id = $2`,
      [req.params.id, req.userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt hittades inte' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

// POST /api/projects
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, number, customer, address, start_date, end_date, budget, status = 'planering' } = req.body
    if (!name) {
      return res.status(400).json({ error: 'name krävs' })
    }

    const result = await query(
      `INSERT INTO projects (name, number, customer, address, start_date, end_date, budget, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, number, customer, address, start_date, end_date, budget, status, req.userId]
    )
    const project = result.rows[0]

    await query(
      'INSERT INTO user_projects (user_id, project_id, role) VALUES ($1, $2, $3)',
      [req.userId, project.id, 'admin']
    )

    res.status(201).json(project)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

// PUT /api/projects/:id
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { name, number, customer, address, start_date, end_date, budget, status } = req.body
    const result = await query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        number = COALESCE($2, number),
        customer = COALESCE($3, customer),
        address = COALESCE($4, address),
        start_date = COALESCE($5, start_date),
        end_date = COALESCE($6, end_date),
        budget = COALESCE($7, budget),
        status = COALESCE($8, status),
        updated_at = NOW()
       WHERE id = $9 AND created_by = $10 RETURNING *`,
      [name, number, customer, address, start_date, end_date, budget, status, req.params.id, req.userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt hittades inte' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

// DELETE /api/projects/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND created_by = $2 RETURNING id',
      [req.params.id, req.userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projekt hittades inte' })
    }
    res.json({ message: 'Projekt borttaget' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

export default router
