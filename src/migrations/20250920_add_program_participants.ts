import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   CREATE TABLE IF NOT EXISTS "program_participants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar(11) NOT NULL,
  	"created_at" timestamp DEFAULT now() NOT NULL,
  	"updated_at" timestamp DEFAULT now() NOT NULL
  );
  
  CREATE INDEX IF NOT EXISTS "program_participants_created_at_idx" ON "program_participants" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "program_participants_updated_at_idx" ON "program_participants" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "program_participants_phone_idx" ON "program_participants" USING btree ("phone");`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   DROP TABLE "program_participants";`)
}
