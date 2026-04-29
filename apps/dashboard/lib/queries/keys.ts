import { getDb } from '../db';
import crypto from 'crypto';

export type KeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  environment: 'live' | 'development';
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  isActive: boolean;
};

export async function getKeys(workspaceId: string): Promise<KeyRow[]> {
  const db = getDb();
  const res = await db.query(`
    SELECT 
      id, 
      name, 
      key_prefix as "keyPrefix", 
      environment, 
      created_at as "createdAt", 
      last_used_at as "lastUsedAt", 
      usage_count as "usageCount", 
      is_active as "isActive"
    FROM api_keys
    WHERE workspace_id = $1
    ORDER BY created_at DESC
  `, [workspaceId]);

  return res.rows;
}

export async function createKey(params: {
  workspaceId: string;
  name: string;
  environment: 'live' | 'development';
}): Promise<{ keyRow: KeyRow; plainKey: string }> {
  const db = getDb();
  const prefix = params.environment === 'live' ? 'aklive_' : 'aktest_';
  const entropy = crypto.randomBytes(32).toString('hex');
  const plainKey = `${prefix}${entropy}`;
  const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');
  const displayPrefix = plainKey.substring(0, 16);

  const res = await db.query(`
    INSERT INTO api_keys (workspace_id, name, key_hash, key_prefix, environment)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING 
      id, 
      name, 
      key_prefix as "keyPrefix", 
      environment, 
      created_at as "createdAt", 
      last_used_at as "lastUsedAt", 
      usage_count as "usageCount", 
      is_active as "isActive"
  `, [params.workspaceId, params.name, keyHash, displayPrefix, params.environment]);

  return {
    keyRow: res.rows[0],
    plainKey,
  };
}

export async function revokeKey(keyId: string, workspaceId: string): Promise<void> {
  const db = getDb();
  await db.query(`
    UPDATE api_keys 
    SET is_active = false, revoked_at = NOW() 
    WHERE id = $1 AND workspace_id = $2
  `, [keyId, workspaceId]);
}
