require('dotenv').config();
const { Client } = require('pg');

async function verifySchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    // Check users table
    const usersResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id'
    `);
    
    console.log('Users table ID column:', usersResult.rows);
    
    // Check users_accounts table
    const accountsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users_accounts' AND column_name IN ('id', '_parent_id')
      ORDER BY column_name
    `);
    
    console.log('Users_accounts table ID columns:', accountsResult.rows);
    
    // Check users_sessions table
    const sessionsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users_sessions' AND column_name IN ('id', '_parent_id')
      ORDER BY column_name
    `);
    
    console.log('Users_sessions table ID columns:', sessionsResult.rows);
    
    // Check foreign key constraints
    const fkResult = await client.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND (tc.table_name = 'users_accounts' OR tc.table_name = 'users_sessions')
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    console.log('Foreign key constraints:', fkResult.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

verifySchema();