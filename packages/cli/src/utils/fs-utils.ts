import { promises as fs } from "node:fs";


/**
 * Checks if a file or directory exists.
 */
export async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely creates a directory if it doesn't exist.
 */
export async function ensureDir(p: string): Promise<void> {
  if (!(await exists(p))) {
    await fs.mkdir(p, { recursive: true });
  }
}

/**
 * Reads a JSON file and parses it.
 */
export async function readJson<T>(p: string): Promise<T | null> {
  try {
    const content = await fs.readFile(p, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Lists subdirectories in a given path.
 */
export async function getSubDirs(p: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(p, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Safely writes a file, checking for existence and the 'force' option.
 */
export async function safeWrite(
  p: string,
  content: string,
  options: { force?: boolean } = {}
): Promise<"created" | "overwritten" | "skipped"> {
  const fileExists = await exists(p);

  if (fileExists && !options.force) {
    return "skipped";
  }

  await fs.writeFile(p, content, "utf-8");
  return fileExists ? "overwritten" : "created";
}
