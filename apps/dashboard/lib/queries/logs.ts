import { getDb } from '../db.js';

export type LogRow = {
  callId: string;
  traceId: string;
  timestampMs: number;
  model: string;
  provider: string;
  environment: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costCents: number;
  latencyMs: number;
  statusCode: number;
  isError: boolean;
  feature: string;
};

export async function getLogs(params: {
  workspaceId: string;
  page: number;
  pageSize: number;
  model?: string;
  provider?: string;
  environment?: string;
  isError?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  rows: LogRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const db = getDb();
  const offset = (params.page - 1) * params.pageSize;
  
  let query = `
    SELECT 
      call_id as "callId", 
      trace_id as "traceId", 
      timestamp_ms as "timestampMs", 
      model, 
      provider, 
      environment, 
      input_tokens as "inputTokens", 
      output_tokens as "outputTokens", 
      total_tokens as "totalTokens", 
      cost_cents as "costCents", 
      latency_ms as "latencyMs", 
      status_code as "statusCode", 
      is_error as "isError", 
      feature
    FROM usage_logs
    WHERE workspace_id = $1
  `;
  
  const values: any[] = [params.workspaceId];
  let valIdx = 2;

  if (params.model) {
    query += ` AND model = $${valIdx++}`;
    values.push(params.model);
  }
  if (params.provider) {
    query += ` AND provider = $${valIdx++}`;
    values.push(params.provider);
  }
  if (params.environment && params.environment !== 'all') {
    query += ` AND environment = $${valIdx++}`;
    values.push(params.environment);
  }
  if (params.isError !== undefined) {
    query += ` AND is_error = $${valIdx++}`;
    values.push(params.isError);
  }
  if (params.search) {
    query += ` AND (call_id ILIKE $${valIdx} OR trace_id ILIKE $${valIdx})`;
    valIdx++;
    values.push(`%${params.search}%`);
  }
  if (params.startDate) {
    query += ` AND timestamp_ms >= $${valIdx++}`;
    values.push(new Date(params.startDate).getTime());
  }
  if (params.endDate) {
    query += ` AND timestamp_ms <= $${valIdx++}`;
    values.push(new Date(params.endDate).getTime());
  }

  // Get total count for pagination
  const countRes = await db.query(`SELECT COUNT(*) FROM (${query}) as count_query`, values);
  const total = parseInt(countRes.rows[0].count);

  query += ` ORDER BY timestamp_ms DESC LIMIT $${valIdx++} OFFSET $${valIdx++}`;
  values.push(params.pageSize, offset);

  const res = await db.query(query, values);
  
  return {
    rows: res.rows,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  };
}

export async function getLogFilters(workspaceId: string): Promise<{
  models: string[];
  providers: string[];
}> {
  const db = getDb();
  const [modelsRes, providersRes] = await Promise.all([
    db.query(`SELECT DISTINCT model FROM usage_logs WHERE workspace_id = $1 AND model IS NOT NULL ORDER BY model`, [workspaceId]),
    db.query(`SELECT DISTINCT provider FROM usage_logs WHERE workspace_id = $1 AND provider IS NOT NULL ORDER BY provider`, [workspaceId]),
  ]);

  return {
    models: modelsRes.rows.map(r => r.model),
    providers: providersRes.rows.map(r => r.provider),
  };
}
