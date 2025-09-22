import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add user address columns
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_line1" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_line2" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_city" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_state" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_postal_code" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_country" varchar;
  `)

  // Add order shipping address columns as NULLable first
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_address_line1" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_address_line2" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_address_city" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_address_state" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_address_postal_code" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_address_country" varchar;
  `)

  // Backfill any existing rows to avoid NOT NULL violations
  await db.execute(sql`
    UPDATE "orders"
    SET
      "shipping_address_line1" = COALESCE("shipping_address_line1", 'Unknown'),
      "shipping_address_city" = COALESCE("shipping_address_city", 'Unknown'),
      "shipping_address_postal_code" = COALESCE("shipping_address_postal_code", '00000'),
      "shipping_address_country" = COALESCE("shipping_address_country", 'Unknown')
    WHERE
      "shipping_address_line1" IS NULL
      OR "shipping_address_city" IS NULL
      OR "shipping_address_postal_code" IS NULL
      OR "shipping_address_country" IS NULL;
  `)

  // Enforce NOT NULL on required columns
  await db.execute(sql`
    ALTER TABLE "orders" ALTER COLUMN "shipping_address_line1" SET NOT NULL;
    ALTER TABLE "orders" ALTER COLUMN "shipping_address_city" SET NOT NULL;
    ALTER TABLE "orders" ALTER COLUMN "shipping_address_postal_code" SET NOT NULL;
    ALTER TABLE "orders" ALTER COLUMN "shipping_address_country" SET NOT NULL;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN "address_line1";
    ALTER TABLE "users" DROP COLUMN "address_line2";
    ALTER TABLE "users" DROP COLUMN "address_city";
    ALTER TABLE "users" DROP COLUMN "address_state";
    ALTER TABLE "users" DROP COLUMN "address_postal_code";
    ALTER TABLE "users" DROP COLUMN "address_country";
    ALTER TABLE "orders" DROP COLUMN "shipping_address_line1";
    ALTER TABLE "orders" DROP COLUMN "shipping_address_line2";
    ALTER TABLE "orders" DROP COLUMN "shipping_address_city";
    ALTER TABLE "orders" DROP COLUMN "shipping_address_state";
    ALTER TABLE "orders" DROP COLUMN "shipping_address_postal_code";
    ALTER TABLE "orders" DROP COLUMN "shipping_address_country";
  `)
}
