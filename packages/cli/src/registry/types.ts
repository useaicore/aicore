/**
 * @module registry/types
 * 
 * Internal types for the Context Registry.
 */

export interface ContextRegistryEntry {
  /** Canonical topic ID (e.g. 'openai', 'stripe') */
  id: string;
  
  /** Helpful aliases (e.g. 'billing' for stripe, 'ai' for openai) */
  aliases: string[];
  
  /** Short summary of what this context pack provides */
  description: string;
  
  /** Whether the generator for this topic is already implemented */
  implemented: boolean;
}

export type ResolveResult = 
  | { ok: true; entry: ContextRegistryEntry }
  | { ok: false; error: string; suggestions?: string[] };
