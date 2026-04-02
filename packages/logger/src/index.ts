import pc from "picocolors";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  component?: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface AICoreLogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: unknown, context?: Record<string, any>): void;
  child(component: string): AICoreLogger;
}

/**
 * Universal logger factory for AICore.
 * Automatically detects environment (Node vs. Cloudflare Worker).
 */
export function createLogger(component: string = "root"): AICoreLogger {
  const isWorker = typeof (globalThis as any).WebSocket === "function" || 
                   !!(globalThis as any).navigator?.userAgent?.includes("Cloudflare");
  
  if (isWorker) {
    return new WorkerLogger(component);
  }
  return new NodeLogger(component);
}

// --- Internal Implementation: Worker (JSON-first) ---

class WorkerLogger implements AICoreLogger {
  constructor(private component: string) {}

  private log(level: LogLevel, message: string, detail?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      component: this.component,
    };

    if (detail instanceof Error) {
      entry.error = { name: detail.name, message: detail.message, stack: detail.stack };
    } else if (detail) {
      entry.context = detail;
    }

    // Always JSON in Cloudflare Worker for Logpush
    console.log(JSON.stringify(entry));
  }

  debug(m: string, c?: any) { this.log("debug", m, c); }
  info(m: string, c?: any) { this.log("info", m, c); }
  warn(m: string, c?: any) { this.log("warn", m, c); }
  error(m: string, e?: any, c?: any) { this.log("error", m, e || c); }

  child(component: string): AICoreLogger {
    return new WorkerLogger(`${this.component}:${component}`);
  }
}

// --- Internal Implementation: Node (Dev-friendly/Pretty) ---

class NodeLogger implements AICoreLogger {
  constructor(private component: string) {}

  private log(level: LogLevel, message: string, detail?: any) {
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isProduction) {
      console.log(JSON.stringify({
        level, message, timestamp: new Date().toISOString(), component: this.component, detail
      }));
      return;
    }

    // Pretty-printing for development (CLI/Local SDK)
    const color = level === "error" ? pc.red : level === "warn" ? pc.yellow : level === "info" ? pc.blue : pc.gray;
    const time = pc.dim(new Date().toLocaleTimeString());
    const comp = pc.magenta(`[${this.component}]`);
    
    console.log(`${time} ${color(level.toUpperCase().padEnd(5))} ${comp} ${message}`);
    if (detail && level !== "error") {
      console.log(pc.dim(JSON.stringify(detail, null, 2)));
    }
    if (detail instanceof Error) {
      console.error(pc.red(detail.stack || detail.message));
    }
  }

  debug(m: string, c?: any) { this.log("debug", m, c); }
  info(m: string, c?: any) { this.log("info", m, c); }
  warn(m: string, c?: any) { this.log("warn", m, c); }
  error(m: string, e?: any, c?: any) { this.log("error", m, e || c); }

  child(component: string): AICoreLogger {
    return new NodeLogger(`${this.component}:${component}`);
  }
}

// Re-export specific loggers if needed
export { createFileUsageLogger } from "./usageLogger.js";
