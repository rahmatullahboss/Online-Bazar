const { Client } = require('pg')
require('dotenv/config')

async function checkTable() {
  let client
  try {
    console.log('Connecting to database...')

    // Try to connect to the database
    client = new Client({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    })

    await client.connect()
    console.log('Connected to database')

    // Check if posts table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'posts'
      );
    `)

    const exists = result.rows[0].exists
    console.log('Posts table exists:', exists)

    if (exists) {
      console.log('Posts table is accessible')
      // Try to query the table
      const countResult = await client.query('SELECT COUNT(*) FROM posts;')
      console.log('Posts count:', countResult.rows[0].count)
    } else {
      console.log('Posts table does not exist')
    }
  } catch (error) {
    console.error('Error checking table:', error.message)
    console.error('Error stack:', error.stack)
  } finally {
    if (client) {
      await client.end()
    }
  }
}

checkTable()
