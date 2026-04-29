'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce.js';

export type SearchResults = {
  logs: {
    callId: string;
    model: string;
    provider: string;
    timestampMs: number;
    costCents: number;
    isError: boolean;
  }[];
  keys: {
    id: string;
    name: string;
    keyPrefix: string;
    environment: string;
  }[];
};

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    
    async function performSearch() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: controller.signal,
        });
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setResults(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    performSearch();

    return () => controller.abort();
  }, [debouncedQuery]);

  return { results, loading, error };
}
