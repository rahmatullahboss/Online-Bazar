import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { Pool } from 'pg'

// Create a pool using the same connection string as in your payload config
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
})

async function checkTables() {
  try {
    // Check if users table exists
    const userTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `)
    
    console.log('Users table exists:', userTable.rows[0].exists)
    
    // Check if users_accounts table exists
    const accountsTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users_accounts'
      );
    `)
    
    console.log('Users accounts table exists:', accountsTable.rows[0].exists)
    
    // If accounts table exists, check its structure
    if (accountsTable.rows[0].exists) {
      const accountsStructure = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users_accounts'
        ORDER BY ordinal_position;
      `)
      
      console.log('Users accounts table structure:')
      accountsStructure.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type}`)
      })
    }
    
    // Close the pool
    await pool.end()
  } catch (error) {
    console.error('Error checking tables:', error)
    await pool.end()
  }
}

checkTables()