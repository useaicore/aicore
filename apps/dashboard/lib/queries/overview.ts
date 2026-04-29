import { getDb } from '../db';

export async function getTotalRequests(workspaceId: string, days: number): Promise<{ count: number; change: number }> {
  const db = getDb();
  const res = await db.query(`
    WITH current_period AS (
      SELECT COUNT(*) as count 
      FROM usage_logs 
      WHERE workspace_id = $1 
      AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
    ),
    previous_period AS (
      SELECT COUNT(*) as count 
      FROM usage_logs 
      WHERE workspace_id = $1 
      AND timestamp_ms <= (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
      AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 172800000)
    )
    SELECT c.count as current_count, p.count as previous_count
    FROM current_period c, previous_period p
  `, [workspaceId, days]);

  const current = parseInt(res.rows[0].current_count);
  const previous = parseInt(res.rows[0].previous_count);
  
  let change = 0;
  if (previous > 0) {
    change = ((current - previous) / previous) * 100;
  }

  return { count: current, change };
}

export async function getTotalSpend(workspaceId: string, days: number): Promise<{ cents: number; change: number }> {
  const db = getDb();
  const res = await db.query(`
    WITH current_period AS (
      SELECT COALESCE(SUM(cost_cents), 0) as cents 
      FROM usage_logs 
      WHERE workspace_id = $1 
      AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
    ),
    previous_period AS (
      SELECT COALESCE(SUM(cost_cents), 0) as cents 
      FROM usage_logs 
      WHERE workspace_id = $1 
      AND timestamp_ms <= (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
      AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 172800000)
    )
    SELECT c.cents as current_cents, p.cents as previous_cents
    FROM current_period c, previous_period p
  `, [workspaceId, days]);

  const current = parseInt(res.rows[0].current_cents);
  const previous = parseInt(res.rows[0].previous_cents);
  
  let change = 0;
  if (previous > 0) {
    change = ((current - previous) / previous) * 100;
  }

  return { cents: current, change };
}

export async function getAvgLatency(workspaceId: string, days: number): Promise<{ ms: number; change: number }> {
  const db = getDb();
  const res = await db.query(`
    WITH current_period AS (
      SELECT COALESCE(AVG(latency_ms), 0) as ms 
      FROM usage_logs 
      WHERE workspace_id = $1 
      AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
    ),
    previous_period AS (
      SELECT COALESCE(AVG(latency_ms), 0) as ms 
      FROM usage_logs 
      WHERE workspace_id = $1 
      AND timestamp_ms <= (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
      AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 172800000)
    )
    SELECT c.ms as current_ms, p.ms as previous_ms
    FROM current_period c, previous_period p
  `, [workspaceId, days]);

  const current = Math.round(parseFloat(res.rows[0].current_ms));
  const previous = Math.round(parseFloat(res.rows[0].previous_ms));
  
  let change = 0;
  if (previous > 0) {
    change = ((current - previous) / previous) * 100;
  }

  return { ms: current, change };
}

export async function getActiveKeyCount(workspaceId: string): Promise<number> {
  const db = getDb();
  const res = await db.query(`
    SELECT COUNT(*) as count 
    FROM api_keys 
    WHERE workspace_id = $1 AND is_active = true
  `, [workspaceId]);

  return parseInt(res.rows[0].count);
}
