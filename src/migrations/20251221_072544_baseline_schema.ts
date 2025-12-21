import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_delivery_zone" AS ENUM('inside_dhaka', 'outside_dhaka');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'user');
  CREATE TYPE "public"."enum_items_variants_size" AS ENUM('xs', 's', 'm', 'l', 'xl', 'xxl', 'free');
  CREATE TYPE "public"."enum_orders_device_type" AS ENUM('mobile', 'desktop', 'tablet', 'other');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('cod', 'bkash', 'nagad');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_orders_delivery_zone" AS ENUM('inside_dhaka', 'outside_dhaka');
  CREATE TYPE "public"."enum_abandoned_carts_status" AS ENUM('active', 'abandoned', 'recovered');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_coupons_discount_type" AS ENUM('percent', 'fixed');
  CREATE TYPE "public"."enum_coupons_applicable_to" AS ENUM('all', 'first_order');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_number" varchar,
  	"delivery_zone" "enum_users_delivery_zone" DEFAULT 'inside_dhaka' NOT NULL,
  	"role" "enum_users_role" DEFAULT 'user' NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"address_city" varchar,
  	"address_state" varchar,
  	"address_postal_code" varchar,
  	"address_country" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"prefix" varchar DEFAULT 'uploads',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "items_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"alt" varchar
  );
  
  CREATE TABLE "items_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"sku" varchar,
  	"size" "enum_items_variants_size",
  	"color" varchar,
  	"weight" varchar,
  	"price" numeric,
  	"stock" numeric DEFAULT 0,
  	"available" boolean DEFAULT true,
  	"image_id" integer
  );
  
  CREATE TABLE "items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"sku" varchar,
  	"short_description" varchar,
  	"description" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"compare_at_price" numeric,
  	"inventory_management_track_inventory" boolean DEFAULT true,
  	"inventory_management_stock" numeric DEFAULT 0 NOT NULL,
  	"inventory_management_low_stock_threshold" numeric DEFAULT 5,
  	"inventory_management_reserved_stock" numeric DEFAULT 0,
  	"inventory_management_allow_backorders" boolean DEFAULT false,
  	"image_id" integer,
  	"image_url" varchar,
  	"has_variants" boolean DEFAULT false,
  	"available" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"category_id" integer,
  	"shipping_weight" numeric,
  	"shipping_free_shipping" boolean DEFAULT false,
  	"shipping_dimensions_length" numeric,
  	"shipping_dimensions_width" numeric,
  	"shipping_dimensions_height" numeric,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "items_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "items_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"items_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item_id" integer NOT NULL,
  	"quantity" numeric NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"coupon_id" integer,
  	"discount_amount" numeric DEFAULT 0,
  	"user_agent" varchar,
  	"device_type" "enum_orders_device_type",
  	"customer_name" varchar NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"customer_number" varchar NOT NULL,
  	"payment_method" "enum_orders_payment_method" DEFAULT 'cod' NOT NULL,
  	"payment_sender_number" varchar,
  	"payment_transaction_id" varchar,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"total_amount" numeric NOT NULL,
  	"subtotal" numeric NOT NULL,
  	"shipping_charge" numeric NOT NULL,
  	"delivery_zone" "enum_orders_delivery_zone" DEFAULT 'inside_dhaka' NOT NULL,
  	"free_delivery_applied" boolean DEFAULT false,
  	"order_date" timestamp(3) with time zone NOT NULL,
  	"shipping_address_line1" varchar NOT NULL,
  	"shipping_address_line2" varchar,
  	"shipping_address_city" varchar NOT NULL,
  	"shipping_address_state" varchar,
  	"shipping_address_postal_code" varchar NOT NULL,
  	"shipping_address_country" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"item_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"reviewer_name" varchar,
  	"rating" numeric NOT NULL,
  	"title" varchar,
  	"comment" varchar NOT NULL,
  	"approved" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "abandoned_carts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item_id" integer NOT NULL,
  	"quantity" numeric NOT NULL
  );
  
  CREATE TABLE "abandoned_carts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" varchar NOT NULL,
  	"user_id" integer,
  	"customer_name" varchar,
  	"customer_email" varchar,
  	"customer_number" varchar,
  	"cart_total" numeric,
  	"status" "enum_abandoned_carts_status" DEFAULT 'active' NOT NULL,
  	"reminder_stage" numeric DEFAULT 0,
  	"last_activity_at" timestamp(3) with time zone NOT NULL,
  	"recovered_order_id" integer,
  	"recovery_email_sent_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "delivery_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Default Delivery Settings' NOT NULL,
  	"inside_dhaka_charge" numeric DEFAULT 80 NOT NULL,
  	"outside_dhaka_charge" numeric DEFAULT 120 NOT NULL,
  	"free_delivery_threshold" numeric DEFAULT 2000 NOT NULL,
  	"digital_payment_delivery_charge" numeric DEFAULT 20 NOT NULL,
  	"shipping_highlight_title" varchar DEFAULT 'Free shipping on orders over 2000 taka' NOT NULL,
  	"shipping_highlight_subtitle" varchar DEFAULT 'Digital wallet payments have a flat Tk 20 delivery charge.' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"author_id" integer NOT NULL,
  	"published_date" timestamp(3) with time zone NOT NULL,
  	"category_id" integer NOT NULL,
  	"featured_image_id" integer,
  	"content" jsonb,
  	"excerpt" varchar,
  	"status" "enum_posts_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "program_participants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coupons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"discount_type" "enum_coupons_discount_type" DEFAULT 'percent' NOT NULL,
  	"discount_value" numeric NOT NULL,
  	"expiry_date" timestamp(3) with time zone,
  	"is_active" boolean DEFAULT true NOT NULL,
  	"usage_limit" numeric DEFAULT 0,
  	"used_count" numeric DEFAULT 0,
  	"applicable_to" "enum_coupons_applicable_to" DEFAULT 'all' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "push_subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"endpoint" varchar NOT NULL,
  	"keys_p256dh" varchar NOT NULL,
  	"keys_auth" varchar NOT NULL,
  	"user_agent" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wishlists_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item_id" integer NOT NULL,
  	"added_at" timestamp(3) with time zone,
  	"notify_on_sale" boolean DEFAULT false,
  	"notify_on_stock" boolean DEFAULT false
  );
  
  CREATE TABLE "wishlists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"item_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"items_id" integer,
  	"categories_id" integer,
  	"orders_id" integer,
  	"reviews_id" integer,
  	"abandoned_carts_id" integer,
  	"delivery_settings_id" integer,
  	"posts_id" integer,
  	"program_participants_id" integer,
  	"coupons_id" integer,
  	"push_subscriptions_id" integer,
  	"wishlists_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "items_gallery" ADD CONSTRAINT "items_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "items_gallery" ADD CONSTRAINT "items_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "items_variants" ADD CONSTRAINT "items_variants_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "items_variants" ADD CONSTRAINT "items_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "items" ADD CONSTRAINT "items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "items_texts" ADD CONSTRAINT "items_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "items_rels" ADD CONSTRAINT "items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "items_rels" ADD CONSTRAINT "items_rels_items_fk" FOREIGN KEY ("items_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "abandoned_carts_items" ADD CONSTRAINT "abandoned_carts_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "abandoned_carts_items" ADD CONSTRAINT "abandoned_carts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."abandoned_carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "abandoned_carts" ADD CONSTRAINT "abandoned_carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "abandoned_carts" ADD CONSTRAINT "abandoned_carts_recovered_order_id_orders_id_fk" FOREIGN KEY ("recovered_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wishlists_items" ADD CONSTRAINT "wishlists_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wishlists_items" ADD CONSTRAINT "wishlists_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_items_fk" FOREIGN KEY ("items_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_abandoned_carts_fk" FOREIGN KEY ("abandoned_carts_id") REFERENCES "public"."abandoned_carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_delivery_settings_fk" FOREIGN KEY ("delivery_settings_id") REFERENCES "public"."delivery_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_program_participants_fk" FOREIGN KEY ("program_participants_id") REFERENCES "public"."program_participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coupons_fk" FOREIGN KEY ("coupons_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_push_subscriptions_fk" FOREIGN KEY ("push_subscriptions_id") REFERENCES "public"."push_subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wishlists_fk" FOREIGN KEY ("wishlists_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "items_gallery_order_idx" ON "items_gallery" USING btree ("_order");
  CREATE INDEX "items_gallery_parent_id_idx" ON "items_gallery" USING btree ("_parent_id");
  CREATE INDEX "items_gallery_image_idx" ON "items_gallery" USING btree ("image_id");
  CREATE INDEX "items_variants_order_idx" ON "items_variants" USING btree ("_order");
  CREATE INDEX "items_variants_parent_id_idx" ON "items_variants" USING btree ("_parent_id");
  CREATE INDEX "items_variants_image_idx" ON "items_variants" USING btree ("image_id");
  CREATE INDEX "items_name_idx" ON "items" USING btree ("name");
  CREATE UNIQUE INDEX "items_sku_idx" ON "items" USING btree ("sku");
  CREATE INDEX "items_image_idx" ON "items" USING btree ("image_id");
  CREATE INDEX "items_category_idx" ON "items" USING btree ("category_id");
  CREATE UNIQUE INDEX "items_seo_seo_slug_idx" ON "items" USING btree ("seo_slug");
  CREATE INDEX "items_updated_at_idx" ON "items" USING btree ("updated_at");
  CREATE INDEX "items_created_at_idx" ON "items" USING btree ("created_at");
  CREATE INDEX "items_texts_order_parent" ON "items_texts" USING btree ("order","parent_id");
  CREATE INDEX "items_rels_order_idx" ON "items_rels" USING btree ("order");
  CREATE INDEX "items_rels_parent_idx" ON "items_rels" USING btree ("parent_id");
  CREATE INDEX "items_rels_path_idx" ON "items_rels" USING btree ("path");
  CREATE INDEX "items_rels_items_id_idx" ON "items_rels" USING btree ("items_id");
  CREATE UNIQUE INDEX "categories_name_idx" ON "categories" USING btree ("name");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_item_idx" ON "orders_items" USING btree ("item_id");
  CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");
  CREATE INDEX "orders_coupon_idx" ON "orders" USING btree ("coupon_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "reviews_item_idx" ON "reviews" USING btree ("item_id");
  CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "abandoned_carts_items_order_idx" ON "abandoned_carts_items" USING btree ("_order");
  CREATE INDEX "abandoned_carts_items_parent_id_idx" ON "abandoned_carts_items" USING btree ("_parent_id");
  CREATE INDEX "abandoned_carts_items_item_idx" ON "abandoned_carts_items" USING btree ("item_id");
  CREATE INDEX "abandoned_carts_user_idx" ON "abandoned_carts" USING btree ("user_id");
  CREATE INDEX "abandoned_carts_recovered_order_idx" ON "abandoned_carts" USING btree ("recovered_order_id");
  CREATE INDEX "abandoned_carts_updated_at_idx" ON "abandoned_carts" USING btree ("updated_at");
  CREATE INDEX "abandoned_carts_created_at_idx" ON "abandoned_carts" USING btree ("created_at");
  CREATE INDEX "delivery_settings_updated_at_idx" ON "delivery_settings" USING btree ("updated_at");
  CREATE INDEX "delivery_settings_created_at_idx" ON "delivery_settings" USING btree ("created_at");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "program_participants_updated_at_idx" ON "program_participants" USING btree ("updated_at");
  CREATE INDEX "program_participants_created_at_idx" ON "program_participants" USING btree ("created_at");
  CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");
  CREATE INDEX "coupons_updated_at_idx" ON "coupons" USING btree ("updated_at");
  CREATE INDEX "coupons_created_at_idx" ON "coupons" USING btree ("created_at");
  CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");
  CREATE UNIQUE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint");
  CREATE INDEX "push_subscriptions_updated_at_idx" ON "push_subscriptions" USING btree ("updated_at");
  CREATE INDEX "push_subscriptions_created_at_idx" ON "push_subscriptions" USING btree ("created_at");
  CREATE INDEX "wishlists_items_order_idx" ON "wishlists_items" USING btree ("_order");
  CREATE INDEX "wishlists_items_parent_id_idx" ON "wishlists_items" USING btree ("_parent_id");
  CREATE INDEX "wishlists_items_item_idx" ON "wishlists_items" USING btree ("item_id");
  CREATE UNIQUE INDEX "wishlists_user_idx" ON "wishlists" USING btree ("user_id");
  CREATE INDEX "wishlists_updated_at_idx" ON "wishlists" USING btree ("updated_at");
  CREATE INDEX "wishlists_created_at_idx" ON "wishlists" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_items_id_idx" ON "payload_locked_documents_rels" USING btree ("items_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_abandoned_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("abandoned_carts_id");
  CREATE INDEX "payload_locked_documents_rels_delivery_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("delivery_settings_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_program_participants_id_idx" ON "payload_locked_documents_rels" USING btree ("program_participants_id");
  CREATE INDEX "payload_locked_documents_rels_coupons_id_idx" ON "payload_locked_documents_rels" USING btree ("coupons_id");
  CREATE INDEX "payload_locked_documents_rels_push_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("push_subscriptions_id");
  CREATE INDEX "payload_locked_documents_rels_wishlists_id_idx" ON "payload_locked_documents_rels" USING btree ("wishlists_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "items_gallery" CASCADE;
  DROP TABLE "items_variants" CASCADE;
  DROP TABLE "items" CASCADE;
  DROP TABLE "items_texts" CASCADE;
  DROP TABLE "items_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "abandoned_carts_items" CASCADE;
  DROP TABLE "abandoned_carts" CASCADE;
  DROP TABLE "delivery_settings" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "program_participants" CASCADE;
  DROP TABLE "coupons" CASCADE;
  DROP TABLE "push_subscriptions" CASCADE;
  DROP TABLE "wishlists_items" CASCADE;
  DROP TABLE "wishlists" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_delivery_zone";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_items_variants_size";
  DROP TYPE "public"."enum_orders_device_type";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_delivery_zone";
  DROP TYPE "public"."enum_abandoned_carts_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum_coupons_discount_type";
  DROP TYPE "public"."enum_coupons_applicable_to";`)
}
