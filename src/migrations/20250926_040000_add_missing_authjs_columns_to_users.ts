import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add name column (combination of firstName and lastName)
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS name TEXT
  `)
  
  // Add customer_number column
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS customer_number TEXT
  `)
  
  // Add delivery_zone column
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS delivery_zone TEXT
  `)
  
  // Add first_name column
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS first_name TEXT
  `)
  
  // Add last_name column
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS last_name TEXT
  `)
  
  // Add address columns
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS address_line1 TEXT
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS address_line2 TEXT
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS address_city TEXT
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS address_state TEXT
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS address_postal_code TEXT
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS address_country TEXT
  `)
  
  // Populate the new columns with existing data (simplified version)
  await db.execute(sql`
    UPDATE users 
    SET 
      name = COALESCE("first_name", '') || ' ' || COALESCE("last_name", ''),
      customer_number = "customer_number",
      delivery_zone = "delivery_zone",
      first_name = "first_name",
      last_name = "last_name"
    WHERE name IS NULL OR name = ' '
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove name column
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS name
  `)
  
  // Remove customer_number column
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS customer_number
  `)
  
  // Remove delivery_zone column
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS delivery_zone
  `)
  
  // Remove first_name column
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS first_name
  `)
  
  // Remove last_name column
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS last_name
  `)
  
  // Remove address columns
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS address_line1
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS address_line2
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS address_city
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS address_state
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS address_postal_code
  `)
  
  await db.execute(sql`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS address_country
  `)
}