import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Create reviews table if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'reviews'
      ) THEN
        CREATE TABLE "reviews" (
          "id" serial PRIMARY KEY NOT NULL,
          "item_id" integer NOT NULL,
          "user_id" integer NOT NULL,
          "rating" numeric NOT NULL,
          "title" varchar,
          "comment" varchar NOT NULL,
          "approved" boolean DEFAULT false NOT NULL,
          "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
        );

        -- Foreign keys
        ALTER TABLE "reviews" ADD CONSTRAINT "reviews_item_id_items_id_fk"
          FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
        ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

        -- Helpful indexes
        CREATE INDEX "reviews_item_idx" ON "reviews" USING btree ("item_id");
        CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_id");
        CREATE INDEX "reviews_approved_idx" ON "reviews" USING btree ("approved");
        CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
        CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "reviews" CASCADE;
  `)
}

