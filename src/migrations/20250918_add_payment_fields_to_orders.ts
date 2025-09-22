import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_method'
      ) THEN
        ALTER TABLE "orders" ADD COLUMN "payment_method" varchar DEFAULT 'cod'::varchar;
        UPDATE "orders" SET "payment_method" = 'cod' WHERE "payment_method" IS NULL;
        ALTER TABLE "orders" ALTER COLUMN "payment_method" SET NOT NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_sender_number'
      ) THEN
        ALTER TABLE "orders" ADD COLUMN "payment_sender_number" varchar;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_transaction_id'
      ) THEN
        ALTER TABLE "orders" ADD COLUMN "payment_transaction_id" varchar;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_method'
      ) THEN
        ALTER TABLE "orders" DROP COLUMN "payment_method";
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_sender_number'
      ) THEN
        ALTER TABLE "orders" DROP COLUMN "payment_sender_number";
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_transaction_id'
      ) THEN
        ALTER TABLE "orders" DROP COLUMN "payment_transaction_id";
      END IF;
    END $$;
  `)
}
