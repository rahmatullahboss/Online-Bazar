import { Payload } from 'payload'

export async function up({ payload }: { payload: Payload }): Promise<void> {
  // Add the missing columns to the users table
  await payload.db.drizzle.execute(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hash_salt VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hash_iterations INTEGER DEFAULT 100000,
    ADD COLUMN IF NOT EXISTS verification_code VARCHAR(255),
    ADD COLUMN IF NOT EXISTS verification_hash VARCHAR(255),
    ADD COLUMN IF NOT EXISTS verification_token_expire TIMESTAMP,
    ADD COLUMN IF NOT EXISTS verification_kind VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reset_password_expiration TIMESTAMP,
    ADD COLUMN IF NOT EXISTS salt VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hash VARCHAR(255),
    ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP;
  `)
}

export async function down({ payload }: { payload: Payload }): Promise<void> {
  // Remove the columns from the users table
  await payload.db.drizzle.execute(`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS hashed_password,
    DROP COLUMN IF EXISTS hash_salt,
    DROP COLUMN IF EXISTS hash_iterations,
    DROP COLUMN IF EXISTS verification_code,
    DROP COLUMN IF EXISTS verification_hash,
    DROP COLUMN IF EXISTS verification_token_expire,
    DROP COLUMN IF EXISTS verification_kind,
    DROP COLUMN IF EXISTS reset_password_token,
    DROP COLUMN IF EXISTS reset_password_expiration,
    DROP COLUMN IF EXISTS salt,
    DROP COLUMN IF EXISTS hash,
    DROP COLUMN IF EXISTS login_attempts,
    DROP COLUMN IF EXISTS lock_until;
  `)
}