const { Client } = require('pg')

async function addMissingColumn() {
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

    // Check if the program_participants table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'program_participants'
      )
    `

    const tableCheckResult = await client.query(tableCheckQuery)
    const tableExists = tableCheckResult.rows[0].exists

    if (!tableExists) {
      console.log('❌ program_participants table does not exist. Creating it first...')

      // Create the program_participants table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS program_participants (
          id serial PRIMARY KEY NOT NULL,
          name varchar NOT NULL,
          phone varchar(11) NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        )
      `

      await client.query(createTableQuery)
      console.log('✅ Created program_participants table')

      // Create indexes
      const createIndexesQuery = `
        CREATE INDEX IF NOT EXISTS program_participants_created_at_idx ON program_participants USING btree (created_at);
        CREATE INDEX IF NOT EXISTS program_participants_updated_at_idx ON program_participants USING btree (updated_at);
        CREATE INDEX IF NOT EXISTS program_participants_phone_idx ON program_participants USING btree (phone);
      `

      await client.query(createIndexesQuery)
      console.log('✅ Created indexes for program_participants table')
    } else {
      console.log('✅ program_participants table already exists')
    }

    // Check if the column exists in payload_locked_documents_rels table
    const columnCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'payload_locked_documents_rels' 
        AND column_name = 'program_participants_id'
      )
    `

    const columnCheckResult = await client.query(columnCheckQuery)
    const columnExists = columnCheckResult.rows[0].exists

    if (!columnExists) {
      console.log('❌ Column program_participants_id does not exist. Adding it now...')

      // Add the missing column
      const addColumnQuery = `
        ALTER TABLE payload_locked_documents_rels 
        ADD COLUMN IF NOT EXISTS program_participants_id INTEGER REFERENCES program_participants(id) ON DELETE CASCADE
      `

      await client.query(addColumnQuery)
      console.log('✅ Added program_participants_id column to payload_locked_documents_rels table')
    } else {
      console.log(
        '✅ Column program_participants_id already exists in payload_locked_documents_rels table',
      )
    }
  } catch (error) {
    console.error('Error:', error.message)
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

addMissingColumn()
