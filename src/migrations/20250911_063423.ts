import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- Add missing column used by cloud storage plugin
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'media'
        AND column_name = 'prefix'
    ) THEN
      ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'uploads';
    END IF;
  END $$;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- Only drop the column if it exists
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'media'
        AND column_name = 'prefix'
    ) THEN
      ALTER TABLE "media" DROP COLUMN "prefix";
    END IF;
  END $$;`)
}
