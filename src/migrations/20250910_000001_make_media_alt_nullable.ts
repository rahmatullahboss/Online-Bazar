import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

// Make `media.alt` nullable to allow drag-and-drop uploads without requiring alt text
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert to NOT NULL; set empty alts to a placeholder to avoid violation
  await db.execute(sql`
    UPDATE "media" SET "alt" = COALESCE(NULLIF(TRIM("alt"), ''), 'Image') WHERE "alt" IS NULL OR TRIM("alt") = '';
    ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  `)
}

