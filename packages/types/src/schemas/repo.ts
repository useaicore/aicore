import { z } from "zod";

/**
 * High-fidelity validation schema for the ProjectProfile.
 * This is the canonical shape for repo detection metadata.
 */
export const ProjectProfileSchema = z.object({
  projectName: z.string().optional(),
  packageManager: z.enum(["pnpm", "npm", "yarn", "bun", "unknown"]),
  runtime: z.enum(["node", "edge", "browser", "mixed", "unknown"]),
  appKind: z.enum([
    "next-app",
    "vite-app",
    "express-api",
    "fastify-api",
    "worker",
    "library",
    "monorepo-root",
    "unknown",
  ]),
  frameworks: z.array(z.string()),
  aiProviders: z.array(z.string()),
  aiFrameworks: z.array(z.string()),
  infra: z.array(z.string()),
  billing: z.array(z.string()),
  auth: z.array(z.string()),
  data: z.array(z.string()),
  queues: z.array(z.string()),
  deployment: z.array(z.string()),
  observability: z.array(z.string()),
  signals: z.object({
    hasPackageJson: z.boolean(),
    hasTsconfig: z.boolean(),
    hasWranglerToml: z.boolean(),
    hasTurboJson: z.boolean(),
    hasPnpmWorkspace: z.boolean(),
    hasEnvExample: z.boolean(),
    hasAppsDir: z.boolean(),
    hasPackagesDir: z.boolean(),
  }),
  evidence: z.record(z.string(), z.string()),
  notes: z.array(z.string()),
  packages: z.array(z.object({
    name: z.string(),
    path: z.string(),
    kind: z.string(),
  })).optional(),
});

export type ProjectProfile = z.infer<typeof ProjectProfileSchema>;
