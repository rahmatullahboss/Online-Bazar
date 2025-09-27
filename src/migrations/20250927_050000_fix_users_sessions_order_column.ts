import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add the _order column to users_sessions table if it doesn't exist
  try {
    await db.execute(sql`
      ALTER TABLE users_sessions ADD COLUMN IF NOT EXISTS _order integer NOT NULL DEFAULT 0;
    `)
    
    // Add index for the _order column if it doesn't exist
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS users_sessions_order_idx ON users_sessions USING btree (_order);
    `)
    
    console.log('Successfully added _order column to users_sessions table')
  } catch (error) {
    console.log('Column _order might already exist or there was an error:', error)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove the _order column from users_sessions table
  try {
    await db.execute(sql`
      ALTER TABLE users_sessions DROP COLUMN IF EXISTS _order;
    `)
    
    console.log('Successfully removed _order column from users_sessions table')
  } catch (error) {
    console.log('Error removing _order column:', error)
  }
}