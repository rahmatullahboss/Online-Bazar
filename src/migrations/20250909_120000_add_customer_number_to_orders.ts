import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add customer_number column as nullable, backfill, then enforce NOT NULL
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_number" varchar;
  `)

  // Backfill existing rows with a placeholder if null
  await db.execute(sql`
    UPDATE "orders"
    SET "customer_number" = COALESCE("customer_number", 'N/A');
  `)

  // Optionally keep as nullable if you prefer; here we enforce NOT NULL
  await db.execute(sql`
    ALTER TABLE "orders" ALTER COLUMN "customer_number" SET NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "customer_number";
  `)
}

