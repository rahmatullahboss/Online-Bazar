import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Fix abandoned_carts_items foreign key constraint to properly handle missing items
    -- First, remove the existing constraint
    ALTER TABLE "abandoned_carts_items" DROP CONSTRAINT IF EXISTS "abandoned_carts_items_item_fk";
    
    -- Add the constraint back with ON DELETE CASCADE to clean up orphaned records
    ALTER TABLE "abandoned_carts_items" ADD CONSTRAINT "abandoned_carts_items_item_fk"
      FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    
    -- Clean up any existing orphaned records (where item_id doesn't exist in items table)
    DELETE FROM "abandoned_carts_items" 
    WHERE "item_id" NOT IN (SELECT "id" FROM "items");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Revert the constraint back to SET NULL
    ALTER TABLE "abandoned_carts_items" DROP CONSTRAINT IF EXISTS "abandoned_carts_items_item_fk";
    
    ALTER TABLE "abandoned_carts_items" ADD CONSTRAINT "abandoned_carts_items_item_fk"
      FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  `)
}
