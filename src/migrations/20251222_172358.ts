import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_chat_conversations_messages_role" AS ENUM('user', 'assistant');
  CREATE TYPE "public"."enum_offers_type" AS ENUM('flash_sale', 'category_sale', 'buy_x_get_y', 'bundle', 'free_shipping', 'promo_banner');
  CREATE TYPE "public"."enum_offers_discount_type" AS ENUM('percent', 'fixed', 'free_item');
  CREATE TYPE "public"."enum_offers_target_type" AS ENUM('all', 'specific_products', 'category');
  CREATE TYPE "public"."enum_offers_highlight_color" AS ENUM('red', 'orange', 'yellow', 'green', 'blue', 'purple');
  CREATE TABLE "chat_conversations_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" "enum_chat_conversations_messages_role" NOT NULL,
  	"content" varchar NOT NULL,
  	"timestamp" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "chat_conversations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" varchar NOT NULL,
  	"user_id" integer,
  	"guest_info_name" varchar,
  	"guest_info_phone" varchar,
  	"message_count" numeric DEFAULT 0,
  	"last_message_at" timestamp(3) with time zone,
  	"metadata_user_agent" varchar,
  	"metadata_ip_address" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "offers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"type" "enum_offers_type" DEFAULT 'flash_sale' NOT NULL,
  	"discount_type" "enum_offers_discount_type" DEFAULT 'percent',
  	"discount_value" numeric,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"display_on_homepage" boolean DEFAULT false,
  	"priority" numeric DEFAULT 0,
  	"target_type" "enum_offers_target_type" DEFAULT 'all',
  	"target_category_id" integer,
  	"bogo_settings_buy_quantity" numeric DEFAULT 2,
  	"bogo_settings_get_quantity" numeric DEFAULT 1,
  	"bundle_price" numeric,
  	"banner_image_id" integer,
  	"banner_link" varchar,
  	"banner_text" varchar,
  	"min_order_value" numeric DEFAULT 0,
  	"usage_limit" numeric DEFAULT 0,
  	"used_count" numeric DEFAULT 0,
  	"badge" varchar,
  	"highlight_color" "enum_offers_highlight_color" DEFAULT 'red',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "offers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"items_id" integer
  );
  
  ALTER TABLE "users" ADD COLUMN "profile_photo_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chat_conversations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "offers_id" integer;
  ALTER TABLE "chat_conversations_messages" ADD CONSTRAINT "chat_conversations_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_target_category_id_categories_id_fk" FOREIGN KEY ("target_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers_rels" ADD CONSTRAINT "offers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offers_rels" ADD CONSTRAINT "offers_rels_items_fk" FOREIGN KEY ("items_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "chat_conversations_messages_order_idx" ON "chat_conversations_messages" USING btree ("_order");
  CREATE INDEX "chat_conversations_messages_parent_id_idx" ON "chat_conversations_messages" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "chat_conversations_session_id_idx" ON "chat_conversations" USING btree ("session_id");
  CREATE INDEX "chat_conversations_user_idx" ON "chat_conversations" USING btree ("user_id");
  CREATE INDEX "chat_conversations_updated_at_idx" ON "chat_conversations" USING btree ("updated_at");
  CREATE INDEX "chat_conversations_created_at_idx" ON "chat_conversations" USING btree ("created_at");
  CREATE INDEX "offers_target_category_idx" ON "offers" USING btree ("target_category_id");
  CREATE INDEX "offers_banner_image_idx" ON "offers" USING btree ("banner_image_id");
  CREATE INDEX "offers_updated_at_idx" ON "offers" USING btree ("updated_at");
  CREATE INDEX "offers_created_at_idx" ON "offers" USING btree ("created_at");
  CREATE INDEX "offers_rels_order_idx" ON "offers_rels" USING btree ("order");
  CREATE INDEX "offers_rels_parent_idx" ON "offers_rels" USING btree ("parent_id");
  CREATE INDEX "offers_rels_path_idx" ON "offers_rels" USING btree ("path");
  CREATE INDEX "offers_rels_items_id_idx" ON "offers_rels" USING btree ("items_id");
  ALTER TABLE "users" ADD CONSTRAINT "users_profile_photo_id_media_id_fk" FOREIGN KEY ("profile_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chat_conversations_fk" FOREIGN KEY ("chat_conversations_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_profile_photo_idx" ON "users" USING btree ("profile_photo_id");
  CREATE INDEX "payload_locked_documents_rels_chat_conversations_id_idx" ON "payload_locked_documents_rels" USING btree ("chat_conversations_id");
  CREATE INDEX "payload_locked_documents_rels_offers_id_idx" ON "payload_locked_documents_rels" USING btree ("offers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "chat_conversations_messages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chat_conversations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offers_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "chat_conversations_messages" CASCADE;
  DROP TABLE "chat_conversations" CASCADE;
  DROP TABLE "offers" CASCADE;
  DROP TABLE "offers_rels" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_profile_photo_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chat_conversations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_offers_fk";
  
  DROP INDEX "users_profile_photo_idx";
  DROP INDEX "payload_locked_documents_rels_chat_conversations_id_idx";
  DROP INDEX "payload_locked_documents_rels_offers_id_idx";
  ALTER TABLE "users" DROP COLUMN "profile_photo_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chat_conversations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "offers_id";
  DROP TYPE "public"."enum_chat_conversations_messages_role";
  DROP TYPE "public"."enum_offers_type";
  DROP TYPE "public"."enum_offers_discount_type";
  DROP TYPE "public"."enum_offers_target_type";
  DROP TYPE "public"."enum_offers_highlight_color";`)
}
