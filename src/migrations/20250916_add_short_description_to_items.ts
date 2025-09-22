import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'items'
          AND column_name = 'short_description'
      ) THEN
        ALTER TABLE "items" ADD COLUMN "short_description" text;
      END IF;
    END $$;
  `)

  await db.execute(sql`
    UPDATE "items"
    SET "short_description" = COALESCE("short_description", "description")
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'items'
          AND column_name = 'short_description'
      ) THEN
        ALTER TABLE "items" DROP COLUMN "short_description";
      END IF;
    END $$;
  `)
}
