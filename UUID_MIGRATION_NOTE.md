# UUID ID Migration Note

This project now uses UUID IDs for all database tables instead of integer/serial IDs to resolve Auth.js compatibility issues.

## Key Changes

1. Updated `payload.config.ts` to set `idType: 'uuid'` in the database adapter configuration
2. Created new migration `20250927_030000_update_auth_tables_to_uuid.ts` to recreate auth-related tables with UUID IDs
3. All new tables will use UUID primary keys automatically

## Deployment Instructions

When deploying to production or setting up a new environment:

1. Ensure your `DATABASE_URL` environment variable is set correctly
2. Run migrations to update the database schema:
   ```bash
   pnpm payload migrate
   ```
3. Verify migration status (should be empty after successful migration):
   ```bash
   pnpm payload migrate:status
   ```

## Verification

To confirm the migration was successful, you can run this SQL query:
```sql
SELECT pg_typeof(id) FROM users LIMIT 1;
```

This should return `uuid` as the type.

## Environment Variables

Ensure these environment variables are set:
- `AUTH_URL` - The base URL for authentication callbacks
- `AUTH_SECRET` - Secret used to sign JWT tokens
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret

After deployment, test Google Sign-In by visiting `/api/auth/signin` and clicking the Google button. The user should be created without errors, and you can verify the session by visiting `/api/auth/session`.