import pg from 'pg';
const { Pool } = pg;
import { env } from './env.js';

let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: env.DATABASE_URL });
  }
  return pool;
}
