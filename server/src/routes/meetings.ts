import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.query as any
    const result = await query(
      `SELECT m.* FROM meetings m
       JOIN user_projects up ON up.project_id = m.project_id
       WHERE up.user_id = $1 ${project_id ? 'AND m.project_id = $2' : ''}
       ORDER BY m.date DESC`,
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
    const { project_id, title, date, attendees = [], decisions = [], action_items = [] } = req.body as any
    if (!project_id || !title || !date) return res.status(400).json({ error: 'project_id, title och date krävs' })
    const result = await query(
      `INSERT INTO meetings (project_id, title, date, attendees, decisions, action_items, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [project_id, title, date, attendees, decisions, action_items, req.userId]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM meetings WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Möte hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, date, attendees, decisions, action_items, summary } = req.body
    const result = await query(
      `UPDATE meetings SET
        title = COALESCE($1, title), date = COALESCE($2, date),
        attendees = COALESCE($3, attendees), decisions = COALESCE($4, decisions),
        action_items = COALESCE($5, action_items), summary = COALESCE($6, summary),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, date, attendees, decisions, action_items, summary, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Möte hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM meetings WHERE id = $1', [req.params.id])
    res.json({ message: 'Möte borttaget' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

export default router
