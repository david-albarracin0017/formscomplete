import { Pool } from 'pg';

// Singleton para evitar múltiples instancias de conexión en desarrollo
let pool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    // Añadimos tiempos de espera para evitar que la conexión "muera"
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });
}

export const db = {
  query: async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      // Esto te ayudará a ver en la terminal si la DB responde
      console.log('Query ejecutada:', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Error en la consulta DB:', error);
      throw error;
    }
  },
};