// Run this script to add the push_subscriptions table and related columns
// Usage: node migrations/run-migration.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration...');
    
    // 1. Create push_subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "push_subscriptions" (
        "id" serial PRIMARY KEY NOT NULL,
        "endpoint" text NOT NULL,
        "keys_p256dh" text NOT NULL,
        "keys_auth" text NOT NULL,
        "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      );
    `);
    console.log('✓ Created push_subscriptions table');

    // 2. Create index for user lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS "push_subscriptions_user_idx" ON "push_subscriptions" ("user_id");
    `);
    console.log('✓ Created push_subscriptions_user_idx index');

    // 3. Add push_subscriptions_id column to payload_locked_documents_rels 
    await client.query(`
      ALTER TABLE "payload_locked_documents_rels" 
      ADD COLUMN IF NOT EXISTS "push_subscriptions_id" integer;
    `);
    console.log('✓ Added push_subscriptions_id column to payload_locked_documents_rels');

    // 4. Create index for the new column
    await client.query(`
      CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_push_subscriptions_id_idx" 
      ON "payload_locked_documents_rels" ("push_subscriptions_id");
    `);
    console.log('✓ Created push_subscriptions_id index');

    console.log('\n✅ Migration completed successfully!');
    console.log('Login should now work correctly.');
    
  } catch (error) {
    console.error('Migration error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
