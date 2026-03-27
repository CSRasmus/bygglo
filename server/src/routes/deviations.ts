import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.query as any
    const result = await query(
      `SELECT d.* FROM deviations d
       JOIN user_projects up ON up.project_id = d.project_id
       WHERE up.user_id = $1 ${project_id ? 'AND d.project_id = $2' : ''}
       ORDER BY d.created_at DESC`,
      project_id ? [req.userId, project_id] : [req.userId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id, title, description, category, priority = 'medel', status = 'upptäckt', location, assigned_to } = req.body as any
    if (!project_id || !title) return res.status(400).json({ error: 'project_id och title krävs' })
    const result = await query(
      `INSERT INTO deviations (project_id, title, description, category, priority, status, location, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [project_id, title, description, category, priority, status, location, assigned_to || null, req.userId]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM deviations WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Avvikelse hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, category, priority, status, location, assigned_to } = req.body
    const result = await query(
      `UPDATE deviations SET
        title = COALESCE($1, title), description = COALESCE($2, description),
        category = COALESCE($3, category), priority = COALESCE($4, priority),
        status = COALESCE($5, status), location = COALESCE($6, location),
        assigned_to = COALESCE($7, assigned_to), updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, description, category, priority, status, location, assigned_to, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Avvikelse hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM deviations WHERE id = $1', [req.params.id])
    res.json({ message: 'Avvikelse borttagen' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

export default router
