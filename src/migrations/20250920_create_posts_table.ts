import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      published_date TIMESTAMP NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      featured_image_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
      content JSONB,
      excerpt TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
    CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
    CREATE INDEX IF NOT EXISTS posts_published_date_idx ON posts(published_date);
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP TABLE IF EXISTS posts;
  `)
}
