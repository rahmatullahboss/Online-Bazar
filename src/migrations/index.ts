import * as migration_20250908_055127 from './20250908_055127'
import * as migration_20250909_050442 from './20250909_050442'
import * as migration_20250909_120000_add_customer_number_to_orders from './20250909_120000_add_customer_number_to_orders'
import * as migration_20250909_123000_guest_checkout_orders_fields from './20250909_123000_guest_checkout_orders_fields'
import * as migration_20250909_130000_add_customer_number_to_users from './20250909_130000_add_customer_number_to_users'
import * as migration_20250910_000001_make_media_alt_nullable from './20250910_000001_make_media_alt_nullable'
import * as migration_20250911_063423 from './20250911_063423'
import * as migration_20250911_add_reviews_table from './20250911_add_reviews_table'
import * as migration_20250911_add_categories_and_item_category from './20250911_add_categories_and_item_category'
import * as migration_20250911_add_categories_lock_rel from './20250911_add_categories_lock_rel'
import * as migration_20250911_rename_snacks_to_items from './20250911_rename_snacks_to_items'
import * as migration_20250912_add_reviews_lock_rel from './20250912_add_reviews_lock_rel'
import * as migration_20250912_add_reviewer_name_to_reviews from './20250912_add_reviewer_name_to_reviews'
import * as migration_20250912_make_orders_items_item_nullable from './20250912_make_orders_items_item_nullable'
import * as migration_20250912_add_device_fields_to_orders from './20250912_add_device_fields_to_orders'
import * as migration_20250913_add_abandoned_carts from './20250913_add_abandoned_carts'
import * as migration_20250914_add_abandoned_cart_reminder_stage from './20250914_add_abandoned_cart_reminder_stage'
import * as migration_20250916_add_short_description_to_items from './20250916_add_short_description_to_items'
import * as migration_20250917_add_delivery_settings from './20250917_add_delivery_settings'
import * as migration_20250917_add_delivery_settings_lock_rel from './20250917_add_delivery_settings_lock_rel'
import * as migration_20250918_add_payment_fields_to_orders from './20250918_add_payment_fields_to_orders'
import * as migration_20250919_update_delivery_settings_with_highlight from './20250919_update_delivery_settings_with_highlight'
import * as migration_20250920_add_posts_collection from './20250920_add_posts_collection'
import * as migration_20250920_create_posts_table from './20250920_create_posts_table'
import * as migration_20250920_add_program_participants from './20250920_add_program_participants'
import * as migration_20250920_update_locked_documents_rels from './20250920_update_locked_documents_rels'
import * as migration_20250920_fix_program_participants_rel from './20250920_fix_program_participants_rel'
import * as migration_20250920_fix_item_category_constraint from './20250920_fix_item_category_constraint'
import * as migration_20250920_fix_abandoned_carts_items_constraint from './20250920_fix_abandoned_carts_items_constraint'
import * as migration_20250925_add_coupons_collection from './20250925_add_coupons_collection'
import * as migration_20250925_add_coupon_id_to_orders from './20250925_add_coupon_id_to_orders'
import * as migration_20250925_add_coupon_fk_constraints from './20250925_add_coupon_fk_constraints'
import * as migration_20250925_add_discount_amount_to_orders from './20250925_add_discount_amount_to_orders'
import * as migration_20250926_010000_make_shipping_address_country_nullable from './20250926_010000_make_shipping_address_country_nullable'
import * as migration_20250926_020000_add_users_accounts_table from './20250926_020000_add_users_accounts_table'
import * as migration_20250926_030000_add_authjs_fields_to_users from './20250926_030000_add_authjs_fields_to_users'
import * as migration_20250926_040000_add_missing_authjs_columns_to_users from './20250926_040000_add_missing_authjs_columns_to_users'
import * as migration_20250927_020000_fix_users_id_type from './20250927_020000_fix_users_id_type'

export const migrations = [
  {
    up: migration_20250908_055127.up,
    down: migration_20250908_055127.down,
    name: '20250908_055127',
  },
  {
    up: migration_20250909_050442.up,
    down: migration_20250909_050442.down,
    name: '20250909_050442',
  },
  {
    up: migration_20250909_120000_add_customer_number_to_orders.up,
    down: migration_20250909_120000_add_customer_number_to_orders.down,
    name: '20250909_120000_add_customer_number_to_orders',
  },
  {
    up: migration_20250909_123000_guest_checkout_orders_fields.up,
    down: migration_20250909_123000_guest_checkout_orders_fields.down,
    name: '20250909_123000_guest_checkout_orders_fields',
  },
  {
    up: migration_20250909_130000_add_customer_number_to_users.up,
    down: migration_20250909_130000_add_customer_number_to_users.down,
    name: '20250909_130000_add_customer_number_to_users',
  },
  {
    up: migration_20250910_000001_make_media_alt_nullable.up,
    down: migration_20250910_000001_make_media_alt_nullable.down,
    name: '20250910_000001_make_media_alt_nullable',
  },
  {
    up: migration_20250911_063423.up,
    down: migration_20250911_063423.down,
    name: '20250911_063423',
  },
  {
    up: migration_20250911_add_reviews_table.up,
    down: migration_20250911_add_reviews_table.down,
    name: '20250911_add_reviews_table',
  },
  {
    up: migration_20250911_add_categories_and_item_category.up,
    down: migration_20250911_add_categories_and_item_category.down,
    name: '20250911_add_categories_and_item_category',
  },
  {
    up: migration_20250911_add_categories_lock_rel.up,
    down: migration_20250911_add_categories_lock_rel.down,
    name: '20250911_add_categories_lock_rel',
  },
  {
    up: migration_20250911_rename_snacks_to_items.up,
    down: migration_20250911_rename_snacks_to_items.down,
    name: '20250911_rename_snacks_to_items',
  },
  {
    up: migration_20250912_add_reviews_lock_rel.up,
    down: migration_20250912_add_reviews_lock_rel.down,
    name: '20250912_add_reviews_lock_rel',
  },
  {
    up: migration_20250912_add_reviewer_name_to_reviews.up,
    down: migration_20250912_add_reviewer_name_to_reviews.down,
    name: '20250912_add_reviewer_name_to_reviews',
  },
  {
    up: migration_20250912_make_orders_items_item_nullable.up,
    down: migration_20250912_make_orders_items_item_nullable.down,
    name: '20250912_make_orders_items_item_nullable',
  },
  {
    up: migration_20250912_add_device_fields_to_orders.up,
    down: migration_20250912_add_device_fields_to_orders.down,
    name: '20250912_add_device_fields_to_orders',
  },
  {
    up: migration_20250913_add_abandoned_carts.up,
    down: migration_20250913_add_abandoned_carts.down,
    name: '20250913_add_abandoned_carts',
  },
  {
    up: migration_20250914_add_abandoned_cart_reminder_stage.up,
    down: migration_20250914_add_abandoned_cart_reminder_stage.down,
    name: '20250914_add_abandoned_cart_reminder_stage',
  },
  {
    up: migration_20250916_add_short_description_to_items.up,
    down: migration_20250916_add_short_description_to_items.down,
    name: '20250916_add_short_description_to_items',
  },
  {
    up: migration_20250917_add_delivery_settings.up,
    down: migration_20250917_add_delivery_settings.down,
    name: '20250917_add_delivery_settings',
  },
  {
    up: migration_20250917_add_delivery_settings_lock_rel.up,
    down: migration_20250917_add_delivery_settings_lock_rel.down,
    name: '20250917_add_delivery_settings_lock_rel',
  },
  {
    up: migration_20250918_add_payment_fields_to_orders.up,
    down: migration_20250918_add_payment_fields_to_orders.down,
    name: '20250918_add_payment_fields_to_orders',
  },
  {
    up: migration_20250919_update_delivery_settings_with_highlight.up,
    down: migration_20250919_update_delivery_settings_with_highlight.down,
    name: '20250919_update_delivery_settings_with_highlight',
  },
  {
    up: migration_20250920_add_posts_collection.up,
    down: migration_20250920_add_posts_collection.down,
    name: '20250920_add_posts_collection',
  },
  {
    up: migration_20250920_create_posts_table.up,
    down: migration_20250920_create_posts_table.down,
    name: '20250920_create_posts_table',
  },
  {
    up: migration_20250920_add_program_participants.up,
    down: migration_20250920_add_program_participants.down,
    name: '20250920_add_program_participants',
  },
  {
    up: migration_20250920_update_locked_documents_rels.up,
    down: migration_20250920_update_locked_documents_rels.down,
    name: '20250920_update_locked_documents_rels',
  },
  {
    up: migration_20250920_fix_program_participants_rel.up,
    down: migration_20250920_fix_program_participants_rel.down,
    name: '20250920_fix_program_participants_rel',
  },
  {
    up: migration_20250920_fix_item_category_constraint.up,
    down: migration_20250920_fix_item_category_constraint.down,
    name: '20250920_fix_item_category_constraint',
  },
  {
    up: migration_20250920_fix_abandoned_carts_items_constraint.up,
    down: migration_20250920_fix_abandoned_carts_items_constraint.down,
    name: '20250920_fix_abandoned_carts_items_constraint',
  },
  {
    up: migration_20250925_add_coupons_collection.up,
    down: migration_20250925_add_coupons_collection.down,
    name: '20250925_add_coupons_collection',
  },
  {
    up: migration_20250925_add_coupon_id_to_orders.up,
    down: migration_20250925_add_coupon_id_to_orders.down,
    name: '20250925_add_coupon_id_to_orders',
  },
  {
    up: migration_20250925_add_coupon_fk_constraints.up,
    down: migration_20250925_add_coupon_fk_constraints.down,
    name: '20250925_add_coupon_fk_constraints',
  },
  {
    up: migration_20250925_add_discount_amount_to_orders.up,
    down: migration_20250925_add_discount_amount_to_orders.down,
    name: '20250925_add_discount_amount_to_orders',
  },
  {
    up: migration_20250926_010000_make_shipping_address_country_nullable.up,
    down: migration_20250926_010000_make_shipping_address_country_nullable.down,
    name: '20250926_010000_make_shipping_address_country_nullable',
  },
  {
    up: migration_20250926_020000_add_users_accounts_table.up,
    down: migration_20250926_020000_add_users_accounts_table.down,
    name: '20250926_020000_add_users_accounts_table',
  },
  {
    up: migration_20250926_030000_add_authjs_fields_to_users.up,
    down: migration_20250926_030000_add_authjs_fields_to_users.down,
    name: '20250926_030000_add_authjs_fields_to_users',
  },
  {
    up: migration_20250926_040000_add_missing_authjs_columns_to_users.up,
    down: migration_20250926_040000_add_missing_authjs_columns_to_users.down,
    name: '20250926_040000_add_missing_authjs_columns_to_users',
  },
  {
    up: migration_20250927_020000_fix_users_id_type.up,
    down: migration_20250927_020000_fix_users_id_type.down,
    name: '20250927_020000_fix_users_id_type',
  },
]
