import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

// Ensure orders_items.item_id is nullable so deleting an item with
// ON DELETE SET NULL succeeds (historic orders remain intact).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders_items' AND column_name = 'item_id'
      ) THEN
        ALTER TABLE "orders_items" ALTER COLUMN "item_id" DROP NOT NULL;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverting to NOT NULL may fail if nulls exist; do it conditionally with a default fallback to 0 (invalid) if needed.
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders_items' AND column_name = 'item_id'
      ) THEN
        -- Only enforce NOT NULL if no NULLs exist
        IF NOT EXISTS (SELECT 1 FROM "orders_items" WHERE "item_id" IS NULL) THEN
          ALTER TABLE "orders_items" ALTER COLUMN "item_id" SET NOT NULL;
        END IF;
      END IF;
    END $$;
  `)
}

