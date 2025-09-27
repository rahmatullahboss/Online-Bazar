import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create support table and all related constraints in one transaction
  await db.execute(sql`
    -- Create support table
    CREATE TABLE IF NOT EXISTS "support" (
      "id" serial PRIMARY KEY NOT NULL,
      "subject" varchar NOT NULL,
      "message" text NOT NULL,
      "user" integer,
      "email" varchar,
      "status" varchar NOT NULL DEFAULT 'open',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Indexes for support
    CREATE INDEX IF NOT EXISTS "support_status_idx" ON "support" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "support_user_idx" ON "support" USING btree ("user");

    -- Add support_id to payload_locked_documents_rels
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "support_id" integer;

    -- Add index for payload_locked_documents_rels
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_support_id_idx" ON "payload_locked_documents_rels" USING btree ("support_id");

    -- Add foreign key constraint for payload_locked_documents_rels
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND constraint_name = 'payload_locked_documents_rels_support_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_support_fk"
          FOREIGN KEY ("support_id") REFERENCES "public"."support"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    -- Add foreign key for user field
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'support' AND constraint_name = 'support_user_fk'
      ) THEN
        ALTER TABLE "support" ADD CONSTRAINT "support_user_fk"
          FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE no action;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Remove rel column, FK, and index for support
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND constraint_name = 'payload_locked_documents_rels_support_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_support_fk";
      END IF;
    END $$;

    DROP INDEX IF EXISTS "payload_locked_documents_rels_support_id_idx";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'payload_locked_documents_rels' AND column_name = 'support_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "support_id";
      END IF;
    END $$;

    -- Drop user FK
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'support' AND constraint_name = 'support_user_fk'
      ) THEN
        ALTER TABLE "support" DROP CONSTRAINT "support_user_fk";
      END IF;
    END $$;

    -- Drop main table
    DROP TABLE IF EXISTS "support" CASCADE;
  `)
}
