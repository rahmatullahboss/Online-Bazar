import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Drop the foreign key constraint
  await db.execute(sql`
    ALTER TABLE users_accounts 
    DROP CONSTRAINT IF EXISTS users_accounts__parent_id_fkey
  `)

  // Alter the _parent_id column to use UUID type instead of INTEGER
  await db.execute(sql`
    ALTER TABLE users_accounts 
    ALTER COLUMN "_parent_id" TYPE UUID USING "_parent_id"::TEXT::UUID
  `)

  // Add the foreign key constraint back
  await db.execute(sql`
    ALTER TABLE users_accounts 
    ADD CONSTRAINT users_accounts__parent_id_fkey 
    FOREIGN KEY ("_parent_id") REFERENCES users(id) ON DELETE CASCADE
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Drop the foreign key constraint
  await db.execute(sql`
    ALTER TABLE users_accounts 
    DROP CONSTRAINT IF EXISTS users_accounts__parent_id_fkey
  `)

  // Revert the _parent_id column to use INTEGER type
  await db.execute(sql`
    ALTER TABLE users_accounts 
    ALTER COLUMN "_parent_id" TYPE INTEGER USING NULL
  `)

  // Add the foreign key constraint back
  await db.execute(sql`
    ALTER TABLE users_accounts 
    ADD CONSTRAINT users_accounts__parent_id_fkey 
    FOREIGN KEY ("_parent_id") REFERENCES users(id) ON DELETE CASCADE
  `)
}
