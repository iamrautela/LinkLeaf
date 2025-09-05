import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'linkleaf',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Query helper function
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
};

// Transaction helper function
export const getClient = async () => {
  return await pool.connect();
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

export default pool;
