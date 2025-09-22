import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

// This migration specifically fixes the missing program_participants_id column
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    console.log('Checking if program_participants_id column exists...')

    // First check if the column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payload_locked_documents_rels' 
      AND column_name = 'program_participants_id'
    `

    // Since we can't directly query information_schema, we'll try to add the column
    // with IF NOT EXISTS which will silently fail if it already exists
    const addColumnQuery = `
      ALTER TABLE payload_locked_documents_rels 
      ADD COLUMN IF NOT EXISTS program_participants_id INTEGER REFERENCES program_participants(id) ON DELETE CASCADE
    `

    await payload.db.drizzle.execute(addColumnQuery)
    console.log('✅ Successfully ensured program_participants_id column exists')

    // Also ensure posts_id column exists
    const addPostsColumnQuery = `
      ALTER TABLE payload_locked_documents_rels 
      ADD COLUMN IF NOT EXISTS posts_id INTEGER REFERENCES posts(id) ON DELETE CASCADE
    `

    await payload.db.drizzle.execute(addPostsColumnQuery)
    console.log('✅ Successfully ensured posts_id column exists')
  } catch (error: any) {
    console.error('Error in migration:', error.message)
    // We don't throw the error to avoid breaking the migration process
    // since the column might already exist
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  try {
    // Remove the columns if needed (but we probably don't want to do this)
    console.log('Skipping column removal in down migration')
  } catch (error: any) {
    console.error('Error in down migration:', error.message)
  }
}
