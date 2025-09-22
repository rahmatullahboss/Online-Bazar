import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Create enum for abandoned_carts.status
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_abandoned_carts_status') THEN
        CREATE TYPE "public"."enum_abandoned_carts_status" AS ENUM('active', 'abandoned', 'recovered');
      END IF;
    END $$;

    -- Create abandoned_carts table
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'abandoned_carts'
      ) THEN
        CREATE TABLE "abandoned_carts" (
          "id" serial PRIMARY KEY NOT NULL,
          "session_id" varchar NOT NULL,
          "user_id" integer,
          "customer_name" varchar,
          "customer_email" varchar,
          "customer_number" varchar,
          "cart_total" numeric,
          "status" "enum_abandoned_carts_status" DEFAULT 'active' NOT NULL,
          "last_activity_at" timestamp(3) with time zone NOT NULL,
          "recovered_order_id" integer,
          "recovery_email_sent_at" timestamp(3) with time zone,
          "notes" text,
          "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
        );
      END IF;
    END $$;

    -- Foreign keys for user and recovered order
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'abandoned_carts' AND constraint_name = 'abandoned_carts_user_id_users_id_fk'
      ) THEN
        ALTER TABLE "abandoned_carts" ADD CONSTRAINT "abandoned_carts_user_id_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'abandoned_carts' AND constraint_name = 'abandoned_carts_recovered_order_id_orders_id_fk'
      ) THEN
        ALTER TABLE "abandoned_carts" ADD CONSTRAINT "abandoned_carts_recovered_order_id_orders_id_fk"
          FOREIGN KEY ("recovered_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    -- Helpful indexes
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'abandoned_carts_session_id_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "abandoned_carts_session_id_idx" ON "abandoned_carts" USING btree ("session_id");
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'abandoned_carts_status_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "abandoned_carts_status_idx" ON "abandoned_carts" USING btree ("status");
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'abandoned_carts_last_activity_at_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "abandoned_carts_last_activity_at_idx" ON "abandoned_carts" USING btree ("last_activity_at");
      END IF;
    END $$;

    -- Array table for items
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'abandoned_carts_items'
      ) THEN
        CREATE TABLE "abandoned_carts_items" (
          "_order" integer NOT NULL,
          "_parent_id" integer NOT NULL,
          "id" varchar PRIMARY KEY NOT NULL,
          "item_id" integer NOT NULL,
          "quantity" numeric NOT NULL
        );
      END IF;
    END $$;

    -- FKs for items array table
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'abandoned_carts_items' AND constraint_name = 'abandoned_carts_items_parent_fk'
      ) THEN
        ALTER TABLE "abandoned_carts_items" ADD CONSTRAINT "abandoned_carts_items_parent_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."abandoned_carts"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'abandoned_carts_items' AND constraint_name = 'abandoned_carts_items_item_fk'
      ) THEN
        ALTER TABLE "abandoned_carts_items" ADD CONSTRAINT "abandoned_carts_items_item_fk"
          FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    -- Indexes for items array table
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'abandoned_carts_items_parent_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "abandoned_carts_items_parent_idx" ON "abandoned_carts_items" USING btree ("_parent_id");
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'abandoned_carts_items_item_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "abandoned_carts_items_item_idx" ON "abandoned_carts_items" USING btree ("item_id");
      END IF;
    END $$;

    -- Add abandoned_carts_id to payload_locked_documents_rels
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'abandoned_carts_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "abandoned_carts_id" integer;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'payload_locked_documents_rels_abandoned_carts_id_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "payload_locked_documents_rels_abandoned_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("abandoned_carts_id");
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND constraint_name = 'payload_locked_documents_rels_abandoned_carts_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_abandoned_carts_fk"
          FOREIGN KEY ("abandoned_carts_id") REFERENCES "public"."abandoned_carts"("id") ON DELETE cascade ON UPDATE no action;
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
        WHERE constraint_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND constraint_name = 'payload_locked_documents_rels_abandoned_carts_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_abandoned_carts_fk";
      END IF;
    END $$;

    DROP INDEX IF EXISTS "payload_locked_documents_rels_abandoned_carts_id_idx";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'abandoned_carts_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "abandoned_carts_id";
      END IF;
    END $$;

    -- Drop array table
    DROP TABLE IF EXISTS "abandoned_carts_items" CASCADE;

    -- Drop main table
    DROP TABLE IF EXISTS "abandoned_carts" CASCADE;

    -- Drop enum type
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_abandoned_carts_status') THEN
        DROP TYPE "public"."enum_abandoned_carts_status";
      END IF;
    END $$;
  `)
}

