import * as path from "node:path";
import { exists, readJson, getSubDirs } from "./utils/fs-utils.js";
import { ProjectProfile } from "./types.js";

/**
 * Builds a project profile by inspecting the workspace.
 */
export async function buildProjectProfile(cwd: string): Promise<ProjectProfile> {
  const profile: ProjectProfile = {
    projectName: path.basename(cwd),
    packageManager: "unknown",
    runtime: "node", // Default
    appKind: "unknown",
    frameworks: [],
    aiProviders: [],
    aiFrameworks: [],
    infra: [],
    billing: [],
    auth: [],
    data: [],
    queues: [],
    deployment: [],
    observability: [],
    signals: {
      hasPackageJson: false,
      hasTsconfig: false,
      hasWranglerToml: false,
      hasTurboJson: false,
      hasPnpmWorkspace: false,
      hasEnvExample: false,
      hasAppsDir: false,
      hasPackagesDir: false,
    },
    evidence: {},
    notes: [],
  };

  // 1. Detect Manifest & Dependencies
  const pkg = await readJson<any>(path.join(cwd, "package.json"));
  if (pkg) {
    profile.signals.hasPackageJson = true;
    profile.projectName = pkg.name || profile.projectName;
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

    // Frameworks
    if (deps["next"]) {
      profile.frameworks.push("next");
      profile.appKind = "next-app";
      profile.evidence["next-app"] = 'Found "next" in package.json dependencies.';
    }
    if (deps["vite"]) {
      profile.frameworks.push("vite");
      profile.appKind = profile.appKind === "unknown" ? "vite-app" : profile.appKind;
      profile.evidence["vite-app"] = 'Found "vite" in dependencies.';
    }
    if (deps["express"]) {
      profile.appKind = "express-api";
      profile.evidence["express-api"] = 'Found "express" in dependencies.';
    }
    if (deps["fastify"]) {
      profile.appKind = "fastify-api";
      profile.evidence["fastify-api"] = 'Found "fastify" in dependencies.';
    }
    if (deps["hono"]) {
      profile.frameworks.push("hono");
      profile.evidence["hono"] = 'Found "hono" in dependencies.';
    }

    // AI Providers
    if (deps["openai"]) {
      profile.aiProviders.push("openai");
      profile.evidence["openai"] = 'Found "openai" in dependencies.';
    }
    if (deps["@anthropic-ai/sdk"]) {
      profile.aiProviders.push("anthropic");
      profile.evidence["anthropic"] = 'Found "@anthropic-ai/sdk" in dependencies.';
    }
    if (deps["@google/generative-ai"]) {
      profile.aiProviders.push("gemini");
      profile.evidence["gemini"] = 'Found "@google/generative-ai" in dependencies.';
    }
    if (deps["groq-sdk"]) {
      profile.aiProviders.push("groq");
      profile.evidence["groq"] = 'Found "groq-sdk" in dependencies.';
    }

    // Billing & Auth & Data
    if (deps["stripe"]) {
      profile.billing.push("stripe");
      profile.evidence["stripe"] = 'Found "stripe" in dependencies.';
    }
    if (deps["next-auth"] || deps["@auth/core"]) {
      profile.auth.push("next-auth");
      profile.evidence["auth"] = 'Found "next-auth" related packages.';
    }
    if (deps["prisma"]) {
      profile.data.push("prisma");
      profile.evidence["prisma"] = 'Found "prisma" in dependencies.';
    }
    if (deps["drizzle-orm"]) {
      profile.data.push("drizzle");
      profile.evidence["drizzle"] = 'Found "drizzle-orm" in dependencies.';
    }
    if (deps["pg"] || deps["postgres"]) {
      profile.data.push("postgres");
      profile.evidence["postgres"] = 'Found PostgreSQL clients.';
    }

    // Queues
    if (deps["bullmq"] || deps["ioredis"]) {
      profile.queues.push("bullmq");
      profile.infra.push("redis");
      profile.evidence["queues"] = 'Found "bullmq" or "ioredis".';
    }

    // Infra
    if (deps["@supabase/supabase-js"]) {
      profile.infra.push("supabase");
      profile.evidence["supabase"] = 'Found "@supabase/supabase-js".';
    }
  }

  // 2. Detect Lockfiles (Package Manager)
  if (await exists(path.join(cwd, "pnpm-lock.yaml"))) {
    profile.packageManager = "pnpm";
    profile.evidence["packageManager"] = "Found pnpm-lock.yaml.";
  } else if (await exists(path.join(cwd, "package-lock.json"))) {
    profile.packageManager = "npm";
    profile.evidence["packageManager"] = "Found package-lock.json.";
  } else if (await exists(path.join(cwd, "yarn.lock"))) {
    profile.packageManager = "yarn";
    profile.evidence["packageManager"] = "Found yarn.lock.";
  } else if (await exists(path.join(cwd, "bun.lockb"))) {
    profile.packageManager = "bun";
    profile.evidence["packageManager"] = "Found bun.lockb.";
  }

  // 3. Detect Configurations & Root Shape
  if (await exists(path.join(cwd, "tsconfig.json"))) {
    profile.signals.hasTsconfig = true;
  }
  if (await exists(path.join(cwd, "wrangler.toml"))) {
    profile.signals.hasWranglerToml = true;
    profile.deployment.push("cloudflare-workers");
    profile.runtime = "edge";
    profile.evidence["deployment"] = "Found wrangler.toml.";
    if (profile.appKind === "unknown") profile.appKind = "worker";
  }
  if (await exists(path.join(cwd, "turbo.json"))) {
    profile.signals.hasTurboJson = true;
    profile.evidence["orchestration"] = "Found turbo.json.";
  }
  if (await exists(path.join(cwd, "pnpm-workspace.yaml"))) {
    profile.signals.hasPnpmWorkspace = true;
    profile.appKind = "monorepo-root";
    profile.evidence["monorepo"] = "Found pnpm-workspace.yaml.";
  }
  if (await exists(path.join(cwd, ".env.example"))) {
    profile.signals.hasEnvExample = true;
  }

  // 4. Directory Structure
  const packagesDir = path.join(cwd, "packages");
  const appsDir     = path.join(cwd, "apps");
  if (await exists(packagesDir)) {
    profile.signals.hasPackagesDir = true;
    if (profile.appKind === "unknown") profile.appKind = "monorepo-root";
  }
  if (await exists(appsDir)) {
    profile.signals.hasAppsDir = true;
    if (profile.appKind === "unknown") profile.appKind = "monorepo-root";
  }

  // 5. Monorepo Special Handling (Summarize Sub-packages)
  if (profile.appKind === "monorepo-root") {
    const pkgDirs = await getSubDirs(packagesDir);
    const appDirs = await getSubDirs(appsDir);
    profile.packages = [];

    for (const dir of [...pkgDirs, ...appDirs]) {
      const dirPath = pkgDirs.includes(dir) ? `packages/${dir}` : `apps/${dir}`;
      const subPkg = await readJson<any>(path.join(cwd, dirPath, "package.json"));
      if (subPkg) {
        profile.packages.push({
          name: subPkg.name || dir,
          path: dirPath,
          kind: subPkg.dependencies?.next ? "next-app" : 
                subPkg.dependencies?.["hono"] ? "api" :
                subPkg.devDependencies?.["wrangler"] ? "worker" : "library"
        });
        
        // Bubble up important signals from sub-packages
        const subDeps = { ...(subPkg.dependencies || {}), ...(subPkg.devDependencies || {}) };
        if (subDeps["bullmq"] && !profile.queues.includes("bullmq")) {
          profile.queues.push("bullmq");
          profile.evidence["queues"] = `Detected in sub-package: ${dirPath}`;
        }
        if (subDeps["openai"] && !profile.aiProviders.includes("openai")) {
           profile.aiProviders.push("openai");
           profile.evidence["openai"] = `Detected in sub-package: ${dirPath}`;
        }
      }
    }
  }

  return profile;
}
