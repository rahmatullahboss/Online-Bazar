-- SQL sanity check to confirm UUID ID types
SELECT pg_typeof(id) FROM users LIMIT 1;

-- Check the schema of auth-related tables
\d users_accounts
\d users_sessions

-- Verify foreign key relationships use UUID
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    pg_typeof(ccu.column_name::text) AS foreign_column_type
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'users_accounts' OR tc.table_name = 'users_sessions');