import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Rename snacks table to items if exists
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'snacks'
      ) THEN
        ALTER TABLE "snacks" RENAME TO "items";
      END IF;
    END $$;

    -- Rename orders_items.snack_id to item_id
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders_items' AND column_name = 'snack_id'
      ) THEN
        ALTER TABLE "orders_items" RENAME COLUMN "snack_id" TO "item_id";
      END IF;
    END $$;

    -- Drop old FK and create new FK to items
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_items_snack_id_snacks_id_fk'
      ) THEN
        ALTER TABLE "orders_items" DROP CONSTRAINT "orders_items_snack_id_snacks_id_fk";
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders_items' AND column_name = 'item_id'
      ) THEN
        ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_item_id_items_id_fk"
        FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    -- Rename payload_locked_documents_rels.snacks_id to items_id and update FK
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'snacks_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "snacks_id" TO "items_id";
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_snacks_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_snacks_fk";
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'items_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_items_fk"
        FOREIGN KEY ("items_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Reverse operations where safe
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'items_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_items_fk";
        ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "items_id" TO "snacks_id";
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders_items' AND column_name = 'item_id'
      ) THEN
        ALTER TABLE "orders_items" DROP CONSTRAINT IF EXISTS "orders_items_item_id_items_id_fk";
        ALTER TABLE "orders_items" RENAME COLUMN "item_id" TO "snack_id";
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'items'
      ) THEN
        ALTER TABLE "items" RENAME TO "snacks";
      END IF;
    END $$;
  `)
}

