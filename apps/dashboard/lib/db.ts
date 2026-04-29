import pg, { type Pool } from 'pg';
const { Pool: PgPool } = pg;
import { env } from './env';

let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    pool = new PgPool({ connectionString: env.DATABASE_URL }) as unknown as Pool;
  }
  return pool;
}
