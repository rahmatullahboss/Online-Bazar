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

    await client.end()
  } catch (err) {
    console.error('Error:', err)
    await client.end()
  }
}

checkSchema()
