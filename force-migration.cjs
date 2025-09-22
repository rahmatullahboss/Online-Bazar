// This script will force the execution of our specific migration
const path = require('path')
process.chdir(__dirname)

// Set environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') })

async function runMigration() {
  try {
    console.log('Loading Payload config...')
    const payloadConfig = await import('./src/payload.config.ts')
    const { getPayload } = await import('payload')

    console.log('Initializing Payload...')
    const payload = await getPayload({
      config: payloadConfig.default,
    })

    console.log('Running migration to add program_participants_id column...')

    // Execute the specific SQL command to add the missing column
    await payload.db.drizzle.execute(`
      ALTER TABLE payload_locked_documents_rels 
      ADD COLUMN IF NOT EXISTS program_participants_id INTEGER REFERENCES program_participants(id) ON DELETE CASCADE
    `)

    console.log(
      '✅ Successfully added program_participants_id column to payload_locked_documents_rels table',
    )

    // Also ensure the posts_id column exists (from the same migration)
    await payload.db.drizzle.execute(`
      ALTER TABLE payload_locked_documents_rels 
      ADD COLUMN IF NOT EXISTS posts_id INTEGER REFERENCES posts(id) ON DELETE CASCADE
    `)

    console.log('✅ Successfully added posts_id column to payload_locked_documents_rels table')
  } catch (error) {
    console.error('❌ Error running migration:', error.message)
    console.error('Stack trace:', error.stack)

    // Check if it's a specific error we can handle
    if (error.message && error.message.includes('already exists')) {
      console.log('ℹ️  Column may already exist, which is fine')
    }
  }
}

runMigration()
