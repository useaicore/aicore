import type { Logger } from "@aicore/types";

export function createLogger(env: 'node' | 'worker'): Logger {
  if (env === 'worker') {
    return {
      info: (msg, ctx) => console.log(JSON.stringify({ level: 'info', msg, ...ctx })),
      error: (msg, err, ctx) => console.error(JSON.stringify({ level: 'error', msg, error: err?.message, ...ctx }))
    };
  }
  
  return {
    info: (_msg, _ctx) => { /* Phase 1 Node JSONL implementation logic goes here */ },
    error: (_msg, _err, _ctx) => { /* Phase 1 Node JSONL implementation logic goes here */ }
  };
}
