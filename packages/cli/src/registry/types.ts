/**
 * @module registry/types
 * 
 * Internal types for the Context Registry.
 */

export interface ContextRegistryEntry {
  /** Canonical topic slug (e.g. 'openai', 'stripe') */
  slug: string;
  
  /** Helpful aliases (e.g. 'billing' for stripe, 'ai' for openai) */
  aliases: string[];

  /** Category of the technology */
  kind: "provider" | "infra" | "framework" | "deployment" | "billing" | "auth" | "queue";
  
  /** Files or packages that hint at this technology's presence */
  detectionHints: string[];

  /** A question to ask the user when adding this context manually */
  optionalQuestion?: string;

  /** Identifier for the generator logic in generators.ts */
  generatorHook: string;

  /** Short summary of what this context pack provides */
  description: string;
  
  /** Whether the generator for this topic is already implemented */
  implemented: boolean;
}

export type ResolveResult = 
  | { ok: true; entry: ContextRegistryEntry }
  | { ok: false; error: string; suggestions?: string[] };
