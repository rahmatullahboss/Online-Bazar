import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'abandoned_carts' AND column_name = 'reminder_stage'
      ) THEN
        ALTER TABLE "abandoned_carts" ADD COLUMN "reminder_stage" integer DEFAULT 0;
        UPDATE "abandoned_carts" SET "reminder_stage" = COALESCE("reminder_stage", 0);
        ALTER TABLE "abandoned_carts" ALTER COLUMN "reminder_stage" SET NOT NULL;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'abandoned_carts' AND column_name = 'reminder_stage'
      ) THEN
        ALTER TABLE "abandoned_carts" DROP COLUMN "reminder_stage";
      END IF;
    END $$;
  `)
}
