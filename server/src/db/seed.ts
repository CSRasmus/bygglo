import bcrypt from 'bcryptjs'
import { query } from '../config/database.js'

export async function seed() {
  console.log('Seeding database...')

  try {
    // Create demo admin user
    const passwordHash = await bcrypt.hash('demo1234', 10)
    const userResult = await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['admin@bygglo.se', passwordHash, 'Admin Andersson', 'admin']
    )
    const userId = userResult.rows[0].id
    console.log('Created user:', userId)

    const rasmusHash = await bcrypt.hash(process.env.WHITELIST_PASSWORD || 'Byggos2026!', 10)
    await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
       RETURNING id`,
      ['rasmus.nilsson9931@gmail.com', rasmusHash, 'Rasmus Nilsson', 'admin']
    )
    console.log('Created lifetime access user: rasmus.nilsson9931@gmail.com')

    // Create demo projects
    const proj1 = await query(
      `INSERT INTO projects (name, number, customer, address, start_date, end_date, budget, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Kontorshus Centrum', 'P-2026-001', 'AB Fastigheter', 'Storgatan 1, Stockholm', '2026-01-15', '2026-12-31', 12500000, 'produktion', userId]
    )

    const proj2 = await query(
      `INSERT INTO projects (name, number, customer, address, start_date, end_date, budget, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Bostadsrätter Södermalm', 'P-2026-002', 'Brf Solsidan', 'Hornsgatan 45, Stockholm', '2026-03-01', '2027-06-30', 45000000, 'planering', userId]
    )

    if (proj1.rows[0]) {
      const p1Id = proj1.rows[0].id

      // Link user to project
      await query(
        `INSERT INTO user_projects (user_id, project_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [userId, p1Id, 'admin']
      )

      // Create activities
      await query(
        `INSERT INTO activities (project_id, name, start_date, end_date, progress, status, trades)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [p1Id, 'Grundläggning', '2026-01-15', '2026-03-15', 100, 'klar', '{mark, betong}']
      )
      await query(
        `INSERT INTO activities (project_id, name, start_date, end_date, progress, status, trades)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [p1Id, 'Stomresning', '2026-03-16', '2026-06-30', 60, 'pågår', '{betong, stål}']
      )
      await query(
        `INSERT INTO activities (project_id, name, start_date, end_date, progress, status, trades)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [p1Id, 'Yttertak', '2026-07-01', '2026-09-30', 0, 'ej_redo', '{tak}']
      )

      // Create deviations
      await query(
        `INSERT INTO deviations (project_id, title, description, category, priority, status, location, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
        [p1Id, 'Spricka i betongpelare', 'Hårspricka synlig i bärande pelare plan 2', 'konstruktion', 'hög', 'upptäckt', 'Plan 2, axel C4', userId]
      )
      await query(
        `INSERT INTO deviations (project_id, title, description, category, priority, status, location, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
        [p1Id, 'Saknat räcke på byggställning', 'Skyddsräcke saknas på ställning vid fasad norr', 'säkerhet', 'kritisk', 'tilldelad', 'Fasad norr, våning 3', userId]
      )

      // Create tasks
      await query(
        `INSERT INTO tasks (project_id, title, description, status, priority, due_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [p1Id, 'Beställ armering för plan 3', 'Kontakta leverantör och bekräfta leveransdatum', 'todo', 'hög', '2026-04-01', userId]
      )
      await query(
        `INSERT INTO tasks (project_id, title, description, status, priority, due_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [p1Id, 'Uppdatera tidsplan', 'Revidera milstolpar baserat på aktuellt läge', 'in_progress', 'medel', '2026-03-25', userId]
      )
      await query(
        `INSERT INTO tasks (project_id, title, description, status, priority, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
        [p1Id, 'Möte med konstruktör', 'Gå igenom sprickan i betongpelaren', 'done', 'hög', userId]
      )
    }

    if (proj2.rows[0]) {
      const p2Id = proj2.rows[0].id
      await query(
        `INSERT INTO user_projects (user_id, project_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [userId, p2Id, 'admin']
      )
    }

    console.log('Database seeded successfully')
    console.log('Login: admin@bygglo.se / demo1234')
    console.log('Lifetime access: rasmus.nilsson9931@gmail.com / Byggos2026!')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seed()
