import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Delivery settings table
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'delivery_settings'
      ) THEN
        CREATE TABLE "delivery_settings" (
          "id" serial PRIMARY KEY NOT NULL,
          "label" varchar NOT NULL,
          "inside_dhaka_charge" numeric DEFAULT 80 NOT NULL,
          "outside_dhaka_charge" numeric DEFAULT 120 NOT NULL,
          "free_delivery_threshold" numeric DEFAULT 2000 NOT NULL,
          "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
        );
      END IF;
    END $$;

    -- Seed default row if table empty
    INSERT INTO "delivery_settings" ("label", "inside_dhaka_charge", "outside_dhaka_charge", "free_delivery_threshold")
    SELECT 'Default Delivery Settings', 80, 120, 2000
    WHERE NOT EXISTS (SELECT 1 FROM "delivery_settings");

    -- User default delivery zone
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "delivery_zone" varchar;
    UPDATE "users" SET "delivery_zone" = COALESCE("delivery_zone", 'inside_dhaka');
    ALTER TABLE "users" ALTER COLUMN "delivery_zone" SET DEFAULT 'inside_dhaka';
    ALTER TABLE "users" ALTER COLUMN "delivery_zone" SET NOT NULL;

    -- Orders fields for delivery pricing
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_zone" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_charge" numeric DEFAULT 0;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "subtotal" numeric DEFAULT 0;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "free_delivery_applied" boolean DEFAULT false;

    UPDATE "orders" SET "delivery_zone" = COALESCE("delivery_zone", 'inside_dhaka');
    UPDATE "orders" SET "shipping_charge" = COALESCE("shipping_charge", 0);
    UPDATE "orders" SET "subtotal" = COALESCE("subtotal", "total_amount");
    UPDATE "orders" SET "free_delivery_applied" = COALESCE("free_delivery_applied", false);

    ALTER TABLE "orders" ALTER COLUMN "delivery_zone" SET DEFAULT 'inside_dhaka';
    ALTER TABLE "orders" ALTER COLUMN "shipping_charge" SET DEFAULT 0;
    ALTER TABLE "orders" ALTER COLUMN "subtotal" SET DEFAULT 0;
    ALTER TABLE "orders" ALTER COLUMN "free_delivery_applied" SET DEFAULT false;

    ALTER TABLE "orders" ALTER COLUMN "delivery_zone" SET NOT NULL;
    ALTER TABLE "orders" ALTER COLUMN "shipping_charge" SET NOT NULL;
    ALTER TABLE "orders" ALTER COLUMN "subtotal" SET NOT NULL;
    ALTER TABLE "orders" ALTER COLUMN "free_delivery_applied" SET NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "delivery_zone";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "shipping_charge";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "subtotal";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "free_delivery_applied";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "delivery_zone";
    DROP TABLE IF EXISTS "delivery_settings" CASCADE;
  `)
}
