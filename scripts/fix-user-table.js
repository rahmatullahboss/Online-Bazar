// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

async function fixUserTable() {
  try {
    console.log('Connecting to database...')
    
    // Check if we have database connection info
    let databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
    
    // If no database URL is set, try to use a default local PostgreSQL connection
    if (!databaseUrl || databaseUrl.includes('your_')) {
      console.log('No valid database URL found, using default local PostgreSQL connection')
      databaseUrl = 'postgresql://postgres:postgres@localhost:5432/online_bazar'
    }
    
    console.log('Using database URL:', databaseUrl.replace(/:[^:@]+@/, ':***@')) // Hide password in logs
    
    // Import pg dynamically
    const { Client } = await import('pg')
    
    const client = new Client({
      connectionString: databaseUrl,
    })
    
    await client.connect()
    
    console.log('Adding missing columns to users table...')
    
    const query = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255),
      ADD COLUMN IF NOT EXISTS hash_salt VARCHAR(255),
      ADD COLUMN IF NOT EXISTS hash_iterations INTEGER DEFAULT 100000,
      ADD COLUMN IF NOT EXISTS verification_code VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verification_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verification_token_expire TIMESTAMP,
      ADD COLUMN IF NOT EXISTS verification_kind VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_password_expiration TIMESTAMP,
      ADD COLUMN IF NOT EXISTS salt VARCHAR(255),
      ADD COLUMN IF NOT EXISTS hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP;
    `
    
    try {
      await client.query(query)
      console.log('Successfully added missing columns to users table')
    } catch (error) {
      console.error('Error adding columns:', error.message)
      return
    }
    
    await client.end()
    console.log('Database connection closed')
    console.log('User table fix completed successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}

fixUserTable()