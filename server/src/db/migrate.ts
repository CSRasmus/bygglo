import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { query } from '../config/database.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function migrate() {
  console.log('Running migrations...')

  try {
    const schemaPath = join(__dirname, '../../../migrations/001_initial_schema.sql')
    const sql = readFileSync(schemaPath, 'utf-8')
    await query(sql)
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()
