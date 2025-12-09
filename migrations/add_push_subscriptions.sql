-- Migration to add PushSubscriptions collection support
-- Run this SQL on your production database (Neon)

-- 1. Create the push_subscriptions table
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "endpoint" text NOT NULL,
  "keys_p256dh" text NOT NULL,
  "keys_auth" text NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- 2. Add user_id foreign key column
ALTER TABLE "push_subscriptions" 
ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL;

-- 3. Create index for user lookups
CREATE INDEX IF NOT EXISTS "push_subscriptions_user_idx" ON "push_subscriptions" ("user_id");

-- 4. Add push_subscriptions_id column to payload_locked_documents_rels table
-- This is what was causing the login error
ALTER TABLE "payload_locked_documents_rels" 
ADD COLUMN IF NOT EXISTS "push_subscriptions_id" integer;

-- 5. Create the foreign key and index
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_push_subscriptions_id_idx" 
ON "payload_locked_documents_rels" ("push_subscriptions_id");

-- 6. Add foreign key constraint (optional but recommended)
-- ALTER TABLE "payload_locked_documents_rels" 
-- ADD CONSTRAINT "payload_locked_documents_rels_push_subscriptions_fk" 
-- FOREIGN KEY ("push_subscriptions_id") REFERENCES "push_subscriptions"("id") ON DELETE CASCADE;

-- Note: Run these commands in order. If any fail, continue with the next.
-- The main issue causing login failure was the missing push_subscriptions_id column.
