import { TOPICS } from "./entries.js";
import { ResolveResult } from "./types.js";

/**
 * Resolves a context topic from an input string (handles Case-Insensitive, IDs, and Aliases).
 */
export function resolveTopic(input: string): ResolveResult {
  const normalizedInput = input.toLowerCase().trim();

  // 1. Slug match
  const entryBySlug = TOPICS.find((t) => t.slug.toLowerCase() === normalizedInput);
  if (entryBySlug) {
    return { ok: true, entry: entryBySlug };
  }

  // 2. Alias match
  const entryByAlias = TOPICS.find((t) => t.aliases.some((a) => a.toLowerCase() === normalizedInput));
  if (entryByAlias) {
    return { ok: true, entry: entryByAlias };
  }

  // 3. Fuzzy match
  const suggestions = TOPICS
    .filter((t) => t.slug.includes(normalizedInput) || t.aliases.some((a) => a.includes(normalizedInput)))
    .map((t) => t.slug);

  return {
    ok: false,
    error: `Unknown context topic: "${input}"`,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}
