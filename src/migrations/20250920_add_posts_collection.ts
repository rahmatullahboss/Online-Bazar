import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // This migration will be handled automatically by Payload
  // when the Posts collection is added to the config
  console.log('Posts collection added to Payload config')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // This migration down will be handled automatically by Payload
  // when the Posts collection is removed from the config
  console.log('Posts collection removed from Payload config')
}
