import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add the discount_amount column to the orders table
  await db.execute(sql`
    -- Add discount_amount column to orders table if it doesn't exist
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" numeric DEFAULT 0;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Remove discount_amount column from orders table
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'discount_amount'
      ) THEN
        ALTER TABLE "orders" DROP COLUMN "discount_amount";
      END IF;
    END $$;
  `)
}