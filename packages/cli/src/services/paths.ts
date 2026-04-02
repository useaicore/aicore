import * as path from "node:path";

/**
 * Common paths for the AICore context system.
 */
export const CONTEXT_DIR_NAME = ".aicorecontext";
export const WORKFLOW_DIR_NAME = "workflow";
export const INTEGRATIONS_DIR_NAME = "integrations";

/**
 * Returns the absolute path to the .aicorecontext directory.
 */
export function getContextDir(cwd: string): string {
  return path.join(cwd, CONTEXT_DIR_NAME);
}

/**
 * Returns the absolute path to a file within the .aicorecontext directory.
 */
export function getContextFilePath(cwd: string, ...subPaths: string[]): string {
  return path.join(getContextDir(cwd), ...subPaths);
}

/**
 * Returns the sub-paths for standard context files.
 */
export const CORE_PATHS = {
  OVERVIEW: "overview.md",
  STACK: "stack.md",
  CODING_TOOLS: [WORKFLOW_DIR_NAME, "coding-tools.md"],
  PROMPTS: [WORKFLOW_DIR_NAME, "prompts.md"],
};
