import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add emailVerified column
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email_verified TIMESTAMP WITH TIME ZONE
  `)
  
  // Add image column
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS image TEXT
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove emailVerified column
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS email_verified
  `)
  
  // Remove image column
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS image
  `)
}