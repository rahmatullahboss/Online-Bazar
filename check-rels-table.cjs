const { Client } = require('pg')

async function checkRelsTable() {
  console.log('Attempting to connect to database...')

  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('Connected to database successfully')

    // Check if the column exists in payload_locked_documents_rels table
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payload_locked_documents_rels' 
      AND column_name = 'program_participants_id'
    `

    console.log('Executing query to check for program_participants_id column...')
    const result = await client.query(query)

    if (result.rows.length > 0) {
      console.log('✅ Column program_participants_id EXISTS in payload_locked_documents_rels table')
    } else {
      console.log(
        '❌ Column program_participants_id does NOT exist in payload_locked_documents_rels table',
      )
    }

    // List all columns in the table
    const columnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payload_locked_documents_rels'
      ORDER BY column_name
    `

    console.log('Fetching all columns in payload_locked_documents_rels table...')
    const columnsResult = await client.query(columnsQuery)
    console.log('All columns in payload_locked_documents_rels table:')
    columnsResult.rows.forEach((row) => {
      console.log('- ' + row.column_name)
    })
  } catch (error) {
    console.error('Error checking table:', error.message)
    console.error('Error stack:', error.stack)
  } finally {
    try {
      await client.end()
      console.log('Database connection closed')
    } catch (endError) {
      console.error('Error closing database connection:', endError.message)
    }
  }
}

checkRelsTable()
