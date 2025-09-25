import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "coupons" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL DEFAULT 'percent',
      discount_value NUMERIC NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
      expiry_date TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN NOT NULL DEFAULT true,
      usage_limit INTEGER DEFAULT 0 CHECK (usage_limit >= 0),
      used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
      applicable_to TEXT NOT NULL DEFAULT 'all',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons" (code);
    CREATE INDEX IF NOT EXISTS "coupons_is_active_idx" ON "coupons" (is_active);
    CREATE INDEX IF NOT EXISTS "coupons_expiry_date_idx" ON "coupons" (expiry_date);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "coupons";
  `)
}
