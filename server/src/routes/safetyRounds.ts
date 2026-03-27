import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.query as any
    const result = await query(
      `SELECT sr.* FROM safety_rounds sr
       JOIN user_projects up ON up.project_id = sr.project_id
       WHERE up.user_id = $1 ${project_id ? 'AND sr.project_id = $2' : ''}
       ORDER BY sr.date DESC`,
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
    const { project_id, date, category, findings = [] } = req.body as any
    if (!project_id || !date || !category) return res.status(400).json({ error: 'project_id, date och category krävs' })
    const result = await query(
      `INSERT INTO safety_rounds (project_id, date, category, findings, conducted_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [project_id, date, category, JSON.stringify(findings), req.userId]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM safety_rounds WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Skyddsrond hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { date, category, findings } = req.body
    const result = await query(
      `UPDATE safety_rounds SET
        date = COALESCE($1, date), category = COALESCE($2, category),
        findings = COALESCE($3, findings), updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [date, category, findings ? JSON.stringify(findings) : null, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Skyddsrond hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM safety_rounds WHERE id = $1', [req.params.id])
    res.json({ message: 'Skyddsrond borttagen' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

export default router
