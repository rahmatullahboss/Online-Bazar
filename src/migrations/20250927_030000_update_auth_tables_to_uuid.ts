import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Drop and recreate the users_accounts table with the correct schema for UUID IDs
  await db.execute(sql`
    DROP TABLE IF EXISTS users_accounts CASCADE;
  `)
  
  await db.execute(sql`
    CREATE TABLE users_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider VARCHAR(255) NOT NULL,
      provider_account_id VARCHAR(255) NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type VARCHAR(255),
      scope VARCHAR(255),
      id_token TEXT,
      session_state VARCHAR(255),
      "_parent_id" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, provider_account_id)
    );
  `)
  
  // Drop and recreate the users_sessions table with the correct schema for UUID IDs
  await db.execute(sql`
    DROP TABLE IF EXISTS users_sessions CASCADE;
  `)
  
  await db.execute(sql`
    CREATE TABLE users_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      expires TIMESTAMP NOT NULL,
      "_parent_id" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_token VARCHAR(255) NOT NULL UNIQUE
    );
  `)
  
  // Update the users table to use UUID as primary key if needed
  // Note: This assumes the users table is already set up with UUID IDs by the Payload configuration
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Drop and recreate the users_accounts table with the INTEGER schema
  await db.execute(sql`
    DROP TABLE IF EXISTS users_accounts CASCADE;
  `)
  
  await db.execute(sql`
    CREATE TABLE users_accounts (
      id SERIAL PRIMARY KEY,
      provider VARCHAR(255) NOT NULL,
      provider_account_id VARCHAR(255) NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type VARCHAR(255),
      scope VARCHAR(255),
      id_token TEXT,
      session_state VARCHAR(255),
      "_parent_id" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, provider_account_id)
    );
  `)
  
  // Drop and recreate the users_sessions table with the INTEGER schema
  await db.execute(sql`
    DROP TABLE IF EXISTS users_sessions CASCADE;
  `)
  
  await db.execute(sql`
    CREATE TABLE users_sessions (
      id SERIAL PRIMARY KEY,
      expires TIMESTAMP NOT NULL,
      "_parent_id" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_token VARCHAR(255) NOT NULL UNIQUE
    );
  `)
}