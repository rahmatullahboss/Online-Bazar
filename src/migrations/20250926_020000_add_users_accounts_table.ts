import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users_accounts (
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
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS users_accounts;
  `)
}