import { Pool } from 'pg';

// El Pool gestiona múltiples conexiones de forma eficiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Requerido para conexiones seguras con Neon
  },
});

export const db = {
  query: (text, params) => pool.query(text, params),
};