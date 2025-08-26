const { Pool } = require('pg');
require('dotenv').config();

// Use a free PostgreSQL database for testing
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:hotel123@db.nhnzptnqonrhvuuyhzti.supabase.co:5432/postgres';

const poolConfig = {
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

