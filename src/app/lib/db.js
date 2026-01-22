import { Pool } from 'pg';

// Singleton para evitar fugas de memoria y agotamiento de conexiones en Vercel/Neon
let pool;

if (!global.pool) {
  global.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Requerido para Neon
    },
    connectionTimeoutMillis: 10000, 
    idleTimeoutMillis: 30000,
    max: 10, // Límite de conexiones para evitar bloqueos en Neon Free Tier
  });
}

pool = global.pool;

export const db = {
  query: async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Query ejecutada:', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Error en la consulta DB:', error);
      throw error; // Lanzamos el error para que actions.js lo capture
    }
  },
};