import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ logs: [], keys: [] });
  }

  const workspaceId = session.user.id;
  const db = getDb();
  const pattern = `%${q}%`;

  try {
    const [logsRes, keysRes] = await Promise.all([
      db.query(`
        SELECT 
          call_id as "callId", 
          model, 
          provider, 
          timestamp_ms as "timestampMs", 
          cost_cents as "costCents", 
          is_error as "isError"
        FROM usage_logs
        WHERE workspace_id = $1 
        AND (call_id ILIKE $2 OR trace_id ILIKE $2 OR model ILIKE $2)
        ORDER BY timestamp_ms DESC
        LIMIT 5
      `, [workspaceId, pattern]),
      db.query(`
        SELECT 
          id, 
          name, 
          key_prefix as "keyPrefix", 
          environment
        FROM api_keys
        WHERE workspace_id = $1 
        AND (name ILIKE $2 OR key_prefix ILIKE $2)
        ORDER BY created_at DESC
        LIMIT 3
      `, [workspaceId, pattern]),
    ]);

    return NextResponse.json({
      logs: logsRes.rows,
      keys: keysRes.rows,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
