// Simple script to insert a default category directly into the database
import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'Loaded' : 'Not found')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not found')

// Get database connection from environment variables
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
})

async function insertDefaultCategory() {
  const client = await pool.connect()

  try {
    // Check if "General" category already exists
    const result = await client.query('SELECT id FROM categories WHERE name = $1', ['General'])

    if (result.rows.length > 0) {
      console.log('Default "General" category already exists with ID:', result.rows[0].id)
      return
    }

    // Insert the default "General" category
    const insertResult = await client.query(
      'INSERT INTO categories (name, description, updated_at, created_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id',
      ['General', 'General items'],
    )

    console.log('Created default category with ID:', insertResult.rows[0].id)
  } catch (error) {
    console.error('Error creating default category:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

insertDefaultCategory()
