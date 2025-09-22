import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Make items.category nullable to match collection configuration
    ALTER TABLE "items" ALTER COLUMN "category" DROP NOT NULL;
    
    -- Ensure items.category_id has proper FK constraint
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'items' AND column_name = 'category_id'
      ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE "items" DROP CONSTRAINT IF EXISTS "items_category_id_categories_id_fk";
        -- Add proper constraint with ON DELETE SET NULL
        ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk"
          FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Revert items.category to NOT NULL if needed (be careful with this)
    -- This should only be done if you're sure all items have categories
    -- ALTER TABLE "items" ALTER COLUMN "category" SET NOT NULL;
    
    -- Revert FK constraint if needed
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'items' AND column_name = 'category_id'
      ) THEN
        ALTER TABLE "items" DROP CONSTRAINT IF EXISTS "items_category_id_categories_id_fk";
        ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk"
          FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}
