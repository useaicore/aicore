import { getDb } from '../db.js';

export async function getDailySpend(workspaceId: string, days: number): Promise<{ date: string; costCents: number }[]> {
  const db = getDb();
  const res = await db.query(`
    SELECT 
      TO_CHAR(TO_TIMESTAMP(timestamp_ms / 1000), 'YYYY-MM-DD') as date,
      SUM(cost_cents) as "costCents"
    FROM usage_logs
    WHERE workspace_id = $1
    AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
    GROUP BY date
    ORDER BY date ASC
  `, [workspaceId, days]);

  // Zero-fill missing days
  const dataMap = new Map(res.rows.map(r => [r.date, parseInt(r.costCents)]));
  const result = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      costCents: dataMap.get(dateStr) || 0,
    });
  }

  return result;
}

export async function getSpendByModel(workspaceId: string, days: number): Promise<{ model: string; costCents: number; requestCount: number }[]> {
  const db = getDb();
  const res = await db.query(`
    SELECT 
      model,
      SUM(cost_cents) as "costCents",
      COUNT(*) as "requestCount"
    FROM usage_logs
    WHERE workspace_id = $1
    AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
    GROUP BY model
    ORDER BY "costCents" DESC
  `, [workspaceId, days]);

  return res.rows.map(r => ({
    model: r.model || 'Unknown',
    costCents: parseInt(r.costCents),
    requestCount: parseInt(r.requestCount),
  }));
}

export async function getSpendByProvider(workspaceId: string, days: number): Promise<{ provider: string; costCents: number; requestCount: number }[]> {
  const db = getDb();
  const res = await db.query(`
    SELECT 
      provider,
      SUM(cost_cents) as "costCents",
      COUNT(*) as "requestCount"
    FROM usage_logs
    WHERE workspace_id = $1
    AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
    GROUP BY provider
    ORDER BY "costCents" DESC
  `, [workspaceId, days]);

  return res.rows.map(r => ({
    provider: r.provider || 'Unknown',
    costCents: parseInt(r.costCents),
    requestCount: parseInt(r.requestCount),
  }));
}

export async function getTokenUsage(workspaceId: string, days: number): Promise<{ date: string; inputTokens: number; outputTokens: number }[]> {
  const db = getDb();
  const res = await db.query(`
    SELECT 
      TO_CHAR(TO_TIMESTAMP(timestamp_ms / 1000), 'YYYY-MM-DD') as date,
      SUM(input_tokens) as "inputTokens",
      SUM(output_tokens) as "outputTokens"
    FROM usage_logs
    WHERE workspace_id = $1
    AND timestamp_ms > (EXTRACT(EPOCH FROM NOW()) * 1000 - $2::bigint * 86400000)
    GROUP BY date
    ORDER BY date ASC
  `, [workspaceId, days]);

  // Zero-fill missing days
  const dataMap = new Map(res.rows.map(r => [r.date, { input: parseInt(r.inputTokens), output: parseInt(r.outputTokens) }]));
  const result = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const val = dataMap.get(dateStr) || { input: 0, output: 0 };
    result.push({
      date: dateStr,
      inputTokens: val.input,
      outputTokens: val.output,
    });
  }

  return result;
}
