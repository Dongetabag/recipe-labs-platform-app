// Supabase Hook
// React hook for Supabase database operations

import { useState, useEffect, useCallback } from 'react';
import { supabaseService, SupabaseRecord, QueryOptions } from '../services/supabaseService';

export interface UseSupabaseOptions<T = SupabaseRecord> {
  table: string;
  options?: QueryOptions;
  autoFetch?: boolean;
  onUpdate?: (data: T[]) => void;
}

export function useSupabase<T = SupabaseRecord>(config: UseSupabaseOptions<T>) {
  const { table, options = {}, autoFetch = true, onUpdate } = config;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(supabaseService.isInitialized());
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await supabaseService.query<T>(table, options);
      setData(result);
      onUpdate?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Supabase fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(options), onUpdate]);

  useEffect(() => {
    if (autoFetch && initialized) {
      fetch();
    }
  }, [autoFetch, initialized, fetch]);

  const create = useCallback(async (record: Partial<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await supabaseService.create<T>(table, record);
      await fetch(); // Refresh data
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table, fetch]);

  const update = useCallback(async (id: string | number, record: Partial<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await supabaseService.update<T>(table, id, record);
      await fetch(); // Refresh data
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table, fetch]);

  const remove = useCallback(async (id: string | number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await supabaseService.delete(table, id);
      await fetch(); // Refresh data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [table, fetch]);

  const subscribe = useCallback((callback: (payload: any) => void) => {
    if (!initialized) {
      console.warn('Supabase not initialized. Subscription not available.');
      return { unsubscribe: () => {} };
    }
    return supabaseService.subscribe<T>(table, callback);
  }, [table, initialized]);

  return {
    data,
    loading,
    error,
    initialized,
    fetch,
    create,
    update,
    remove,
    subscribe,
    refetch: fetch,
  };
}


