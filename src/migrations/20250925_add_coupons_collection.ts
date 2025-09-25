import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Create coupons table
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'coupons'
      ) THEN
        CREATE TABLE "coupons" (
          "id" serial PRIMARY KEY NOT NULL,
          "code" varchar NOT NULL UNIQUE,
          "discount_type" varchar NOT NULL DEFAULT 'percent',
          "discount_value" numeric NOT NULL DEFAULT 0,
          "expiry_date" timestamp(3) with time zone,
          "is_active" boolean NOT NULL DEFAULT true,
          "usage_limit" integer DEFAULT 0,
          "used_count" integer NOT NULL DEFAULT 0,
          "applicable_to" varchar NOT NULL DEFAULT 'all',
          "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
        );
      END IF;
    END $$;

    -- Indexes for coupons
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'coupons_code_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'coupons_is_active_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "coupons_is_active_idx" ON "coupons" USING btree ("is_active");
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'coupons_expiry_date_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "coupons_expiry_date_idx" ON "coupons" USING btree ("expiry_date");
      END IF;
    END $$;

    -- Add coupons_id to payload_locked_documents_rels
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'coupons_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "coupons_id" integer;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'payload_locked_documents_rels_coupons_id_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "payload_locked_documents_rels_coupons_id_idx" ON "payload_locked_documents_rels" USING btree ("coupons_id");
      END IF;
    END $$;

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
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Remove rel column, FK, and index
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND constraint_name = 'payload_locked_documents_rels_coupons_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_coupons_fk";
      END IF;
    END $$;

    DROP INDEX IF EXISTS "payload_locked_documents_rels_coupons_id_idx";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'coupons_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "coupons_id";
      END IF;
    END $$;

    -- Drop main table
    DROP TABLE IF EXISTS "coupons" CASCADE;
  `)
}
