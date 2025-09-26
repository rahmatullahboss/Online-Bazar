const { Client } = require('pg')

// Get database URL from environment variable
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function checkSchema() {
  try {
    await client.connect()

    // Check users table ID column type
    const usersIdResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id'
    `)

    console.log('Users ID column:', usersIdResult.rows)

    // Check users_accounts table columns
    const accountsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users_accounts' 
      ORDER BY ordinal_position
    `)

    console.log('Users_accounts columns:', accountsResult.rows)

    // Check if there are any records in users_accounts
    const countResult = await client.query(`
      SELECT COUNT(*) as count FROM users_accounts
    `)

    console.log('Users_accounts record count:', countResult.rows[0].count)

    // Check for foreign key constraints referencing users table
    const fkResult = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users'
    `)

    console.log('Foreign key constraints referencing users table:', fkResult.rows)

    await client.end()
  } catch (err) {
    console.error('Error:', err)
    await client.end()
  }
}

checkSchema()
