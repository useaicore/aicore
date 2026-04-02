/**
 * @module types
 * 
 * Internal types for the AICore CLI.
 */

export type ProjectProfile = {
  projectName?: string;

  packageManager: "pnpm" | "npm" | "yarn" | "bun" | "unknown";
  runtime: "node" | "edge" | "browser" | "mixed" | "unknown";
  appKind:
    | "next-app"
    | "vite-app"
    | "express-api"
    | "fastify-api"
    | "worker"
    | "library"
    | "monorepo-root"
    | "unknown";

  frameworks: string[];    // e.g. ["next", "react"]
  aiProviders: string[];   // e.g. ["openai", "anthropic", "gemini", "groq"]
  aiFrameworks: string[];  // e.g. ["langchain"]
  infra: string[];         // e.g. ["supabase", "postgres", "redis"]
  billing: string[];       // e.g. ["stripe"]
  auth: string[];          // e.g. ["next-auth"]
  data: string[];          // e.g. ["postgres", "prisma", "drizzle"]
  queues: string[];        // e.g. ["bullmq"]
  deployment: string[];    // e.g. ["cloudflare-workers", "vercel"]
  observability: string[]; // keep basic for now

  signals: {
    hasPackageJson: boolean;
    hasTsconfig: boolean;
    hasWranglerToml: boolean;
    hasTurboJson: boolean;
    hasPnpmWorkspace: boolean;
    hasEnvExample: boolean;
    hasAppsDir: boolean;
    hasPackagesDir: boolean;
  };

  /** Internal evidence map: technology -> reason for detection */
  evidence: Record<string, string>;

  /** Optional notes for debugging and later UX */
  notes: string[];

  /** For monorepos: summary of sub-packages */
  packages?: Array<{
    name: string;
    path: string;
    kind: string;
  }>;
};
