import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add coupon_id column to orders table and index
  await db.execute(sql`
    -- Add coupon_id column to orders table
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_id" integer;

    -- Add index for better query performance
    CREATE INDEX IF NOT EXISTS "orders_coupon_id_idx" ON "orders" USING btree ("coupon_id");

    -- Add coupon_id to payload_locked_documents_rels
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "coupons_id" integer;

    -- Add index for payload_locked_documents_rels
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_coupons_id_idx" ON "payload_locked_documents_rels" USING btree ("coupons_id");
  `)
  
  // Add foreign key constraints in a separate statement to ensure the tables exist
  // We'll add these constraints after ensuring the coupons table exists
  try {
    await db.execute(sql`
      -- Add foreign key constraint for orders
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_schema = 'public' AND table_name = 'orders' AND constraint_name = 'orders_coupon_id_fk'
        ) THEN
          ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fk"
            FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;
        END IF;
      END $$;

      -- Add foreign key constraint for payload_locked_documents_rels
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND constraint_name = 'payload_locked_documents_rels_coupons_fk'
        ) THEN
          ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coupons_fk"
            FOREIGN KEY ("coupons_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `)
  } catch (error) {
    // If the foreign key constraints fail, we'll log the error but continue
    console.warn('Could not add foreign key constraints for coupon_id. This might be because the coupons table does not exist yet. The constraints will be added when the coupons table is created.')
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Remove foreign key constraint from orders
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'orders' AND constraint_name = 'orders_coupon_id_fk'
      ) THEN
        ALTER TABLE "orders" DROP CONSTRAINT "orders_coupon_id_fk";
      END IF;
    END $$;

    -- Remove foreign key constraint
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND constraint_name = 'payload_locked_documents_rels_coupons_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_coupons_fk";
      END IF;
    END $$;

    -- Remove index from orders
    DROP INDEX IF EXISTS "orders_coupon_id_idx";

    -- Remove index
    DROP INDEX IF EXISTS "payload_locked_documents_rels_coupons_id_idx";

    -- Remove coupon_id column from orders
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'coupon_id'
      ) THEN
        ALTER TABLE "orders" DROP COLUMN "coupon_id";
      END IF;
    END $$;

    -- Remove column
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'coupons_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "coupons_id";
      END IF;
    END $$;
  `)
}