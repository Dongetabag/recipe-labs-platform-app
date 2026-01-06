// Hook for Baserow data management
import { useState, useCallback, useEffect } from 'react';
import { baserowService, BaserowRecord, BaserowTable, Filter } from '../services/baserowService.js';

export function useBaserow() {
  const [tables, setTables] = useState<BaserowTable[]>([]);
  const [cache, setCache] = useState<Map<string, BaserowRecord[]>>(new Map());
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync table
  const syncTable = useCallback(async (tableId: string): Promise<BaserowRecord[]> => {
    setIsLoading(true);
    try {
      const records = await baserowService.syncTable(tableId);
      setCache(prev => {
        const updated = new Map(prev);
        updated.set(tableId, records);
        return updated;
      });
      setLastSync(new Date());
      return records;
    } catch (error) {
      console.error('Failed to sync table:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create record
  const createRecord = useCallback(async (
    tableId: string,
    data: any
  ): Promise<BaserowRecord> => {
    setIsLoading(true);
    try {
      const record = await baserowService.createRecord(tableId, data);
      // Invalidate cache
      setCache(prev => {
        const updated = new Map(prev);
        updated.delete(tableId);
        return updated;
      });
      return record;
    } catch (error) {
      console.error('Failed to create record:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update record
  const updateRecord = useCallback(async (
    tableId: string,
    recordId: number,
    data: any
  ): Promise<BaserowRecord> => {
    setIsLoading(true);
    try {
      const record = await baserowService.updateRecord(tableId, recordId, data);
      // Invalidate cache
      setCache(prev => {
        const updated = new Map(prev);
        updated.delete(tableId);
        return updated;
      });
      return record;
    } catch (error) {
      console.error('Failed to update record:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete record
  const deleteRecord = useCallback(async (tableId: string, recordId: number): Promise<void> => {
    setIsLoading(true);
    try {
      await baserowService.deleteRecord(tableId, recordId);
      // Invalidate cache
      setCache(prev => {
        const updated = new Map(prev);
        updated.delete(tableId);
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Query records
  const queryRecords = useCallback(async (
    tableId: string,
    filters: Filter[] = []
  ): Promise<BaserowRecord[]> => {
    setIsLoading(true);
    try {
      return await baserowService.queryRecords(tableId, filters);
    } catch (error) {
      console.error('Failed to query records:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get cached records
  const getCachedRecords = useCallback((tableId: string): BaserowRecord[] => {
    return cache.get(tableId) || [];
  }, [cache]);

  // Clear cache
  const clearCache = useCallback((tableId?: string) => {
    if (tableId) {
      setCache(prev => {
        const updated = new Map(prev);
        updated.delete(tableId);
        return updated;
      });
    } else {
      setCache(new Map());
    }
    baserowService.clearCache(tableId);
  }, []);

  return {
    tables,
    cache: Array.from(cache.entries()),
    lastSync,
    isLoading,
    syncTable,
    createRecord,
    updateRecord,
    deleteRecord,
    queryRecords,
    getCachedRecords,
    clearCache,
  };
}

