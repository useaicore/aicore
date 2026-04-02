import { TOPICS } from "./entries.js";
import { ResolveResult } from "./types.js";

/**
 * Resolves a context topic from an input string (handles Case-Insensitive, IDs, and Aliases).
 */
export function resolveTopic(input: string): ResolveResult {
  const normalizedInput = input.toLowerCase().trim();

  // 1. Direct ID match
  const entryByDirectId = TOPICS.find((t) => t.id.toLowerCase() === normalizedInput);
  if (entryByDirectId) {
    return { ok: true, entry: entryByDirectId };
  }

  // 2. Alias match
  const entryByAlias = TOPICS.find((t) => t.aliases.some((a) => a.toLowerCase() === normalizedInput));
  if (entryByAlias) {
    return { ok: true, entry: entryByAlias };
  }

  // 3. Fuzzy/No match - Return error with suggestions
  const suggestions = TOPICS
    .filter((t) => t.id.includes(normalizedInput) || t.aliases.some((a) => a.includes(normalizedInput)))
    .map((t) => t.id);

  return {
    ok: false,
    error: `Unknown context topic: "${input}"`,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}
