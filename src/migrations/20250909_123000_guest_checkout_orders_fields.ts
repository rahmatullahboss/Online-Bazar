import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_name" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_email" varchar;
  `)

  await db.execute(sql`
    UPDATE "orders" SET
      "customer_name" = COALESCE("customer_name", 'Guest'),
      "customer_email" = COALESCE("customer_email", 'unknown@example.com')
    WHERE "customer_name" IS NULL OR "customer_email" IS NULL;
  `)

  await db.execute(sql`
    ALTER TABLE "orders" ALTER COLUMN "customer_name" SET NOT NULL;
    ALTER TABLE "orders" ALTER COLUMN "customer_email" SET NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ALTER COLUMN "user_id" SET NOT NULL;
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "customer_name";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "customer_email";
  `)
}

