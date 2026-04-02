import * as path from "node:path";
import { buildProjectProfile } from "../detect.js";
import { describe, it, expect } from "@jest/globals";

describe("buildProjectProfile", () => {
  const fixturesDir = path.join(process.cwd(), "src", "__tests__", "fixtures");

  it("should detect a simple Next.js app with OpenAI and Stripe", async () => {
    const cwd = path.join(fixturesDir, "simple-next-app");
    const profile = await buildProjectProfile(cwd);

    expect(profile.projectName).toBe("next-app");
    expect(profile.appKind).toBe("next-app");
    expect(profile.frameworks).toContain("next");
    expect(profile.aiProviders).toContain("openai");
    expect(profile.billing).toContain("stripe");
    expect(profile.signals.hasPackageJson).toBe(true);
  });

  it("should detect a monorepo root with a Cloudflare Worker sub-package", async () => {
    const cwd = path.join(fixturesDir, "worker-monorepo");
    const profile = await buildProjectProfile(cwd);

    expect(profile.appKind).toBe("monorepo-root");
    expect(profile.packageManager).toBe("unknown"); // No lockfile in fixture
    expect(profile.signals.hasPnpmWorkspace).toBe(true);
    expect(profile.signals.hasPackagesDir).toBe(true);

    // Verify sub-package detection
    expect(profile.packages).toBeDefined();
    const workerPkg = profile.packages?.find(p => p.name === "@aicore/worker");
    expect(workerPkg).toBeDefined();
    expect(workerPkg?.kind).toBe("worker");
    expect(workerPkg?.path).toBe("packages/worker");
    
    // Bubble-up check
    expect(profile.frameworks).toContain("hono");
  });
});
