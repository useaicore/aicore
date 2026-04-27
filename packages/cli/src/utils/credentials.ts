import { readFile, writeFile, mkdir, chmod } from "fs/promises";
import path from "path";
import os from "os";

const credentialsPath = path.join(os.homedir(), ".aicore", "credentials");

export async function setKey(prefix: string, key: string): Promise<void> {
  try {
    const { default: keytar } = await import("keytar");
    await keytar.setPassword("aicore", prefix, key); // ← service name must match getKey
    return; // ← explicit early return so file fallback is skipped on success
  } catch { /* keytar unavailable — fall through */ }

  // File fallback
  await mkdir(path.dirname(credentialsPath), { recursive: true });
  let existing: Record<string, string> = {};
  try {
    existing = JSON.parse(await readFile(credentialsPath, "utf8"));
  } catch { /* File doesn't exist yet or is malformed — start fresh */ }
  await writeFile(credentialsPath, JSON.stringify({ ...existing, [prefix]: key }), "utf8");
  try {
    await chmod(credentialsPath, 0o600);
  } catch { /* chmod may not be supported on Windows — silently ignore */ }
}

export async function getKey(prefix: string): Promise<string | null> {
  try {
    const { default: keytar } = await import("keytar");
    const val = await keytar.getPassword("aicore", prefix);
    if (val) return val; // ← only short-circuit on a real value; null falls through
  } catch { /* keytar unavailable */ }

  // File fallback runs for both: keytar missing AND keytar found but key not in keychain
  try {
    const raw = await readFile(credentialsPath, "utf8");
    const existing = JSON.parse(raw);
    return existing[prefix] ?? null;
  } catch {
    return null;
  }
}
