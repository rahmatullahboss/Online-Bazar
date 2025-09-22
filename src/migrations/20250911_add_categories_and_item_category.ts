import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Create categories table if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'categories'
      ) THEN
        CREATE TABLE "categories" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" varchar NOT NULL,
          "description" varchar,
          "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
        );
        CREATE UNIQUE INDEX "categories_name_idx" ON "categories" USING btree ("name");
      END IF;
    END $$;

    -- Add items.category_id if missing and FK to categories(id)
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'items' AND column_name = 'category_id'
      ) THEN
        ALTER TABLE "items" ADD COLUMN "category_id" integer;
        ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk"
          FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id")
          ON DELETE set null ON UPDATE no action;
        CREATE INDEX "items_category_idx" ON "items" USING btree ("category_id");
      END IF;
    END $$;

    -- Seed category rows from legacy enum/text column if present
    -- Insert distinct legacy categories into categories table
    INSERT INTO "categories" ("name")
    SELECT DISTINCT ("category")::text AS name
    FROM "items"
    WHERE "category" IS NOT NULL
    ON CONFLICT ("name") DO NOTHING;

    -- Backfill items.category_id by matching on name
    UPDATE "items" AS i
    SET "category_id" = c.id
    FROM "categories" AS c
    WHERE c.name = (i."category")::text
      AND i."category_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Remove FK and column from items if exists
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'items' AND column_name = 'category_id'
      ) THEN
        ALTER TABLE "items" DROP CONSTRAINT IF EXISTS "items_category_id_categories_id_fk";
        DROP INDEX IF EXISTS "items_category_idx";
        ALTER TABLE "items" DROP COLUMN "category_id";
      END IF;
    END $$;

    -- Drop categories table if exists
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'categories'
      ) THEN
        DROP TABLE "categories";
      END IF;
    END $$;
  `)
}

