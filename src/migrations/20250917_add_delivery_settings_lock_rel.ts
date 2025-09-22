import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Add delivery_settings_id to payload_locked_documents_rels for lock / relation tracking
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'delivery_settings_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "delivery_settings_id" integer;
      END IF;
    END $$;

    -- Create index if missing
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'i' AND c.relname = 'payload_locked_documents_rels_delivery_settings_id_idx' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "payload_locked_documents_rels_delivery_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("delivery_settings_id");
      END IF;
    END $$;

    -- Add FK if missing
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND constraint_name = 'payload_locked_documents_rels_delivery_settings_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_delivery_settings_fk"
          FOREIGN KEY ("delivery_settings_id") REFERENCES "public"."delivery_settings"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Drop FK and index then column, if they exist
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND constraint_name = 'payload_locked_documents_rels_delivery_settings_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_delivery_settings_fk";
      END IF;
    END $$;

    DROP INDEX IF EXISTS "payload_locked_documents_rels_delivery_settings_id_idx";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'delivery_settings_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "delivery_settings_id";
      END IF;
    END $$;
  `)
}
