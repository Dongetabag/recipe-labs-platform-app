// Supabase Database Service
// Manages Supabase database integration and real-time data sync

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface SupabaseRecord {
  id: string | number;
  [key: string]: any;
}

export interface QueryOptions {
  select?: string;
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private initialized: boolean = false;

  constructor() {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      this.initialized = true;
    } else {
      console.warn('Supabase credentials not configured. Service will use mock data.');
    }
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
    return this.client;
  }

  async query<T = SupabaseRecord>(
    table: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    try {
      if (!this.initialized) {
        return this.getMockData(table) as T[];
      }

      let query = this.getClient().from(table).select(options.select || '*');

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending !== false,
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Apply offset
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }

      return (data || []) as T[];
    } catch (error) {
      console.error('Failed to query Supabase:', error);
      return this.getMockData(table) as T[];
    }
  }

  async getById<T = SupabaseRecord>(table: string, id: string | number): Promise<T | null> {
    try {
      if (!this.initialized) {
        const mockData = this.getMockData(table);
        return (mockData.find((item: any) => item.id === id) || null) as T;
      }

      const { data, error } = await this.getClient()
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Supabase get error: ${error.message}`);
      }

      return data as T;
    } catch (error) {
      console.error('Failed to get record from Supabase:', error);
      return null;
    }
  }

  async create<T = SupabaseRecord>(table: string, data: Partial<T>): Promise<T> {
    try {
      if (!this.initialized) {
        return { id: Date.now(), ...data } as T;
      }

      const { data: result, error } = await this.getClient()
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase create error: ${error.message}`);
      }

      return result as T;
    } catch (error) {
      console.error('Failed to create record in Supabase:', error);
      throw error;
    }
  }

  async update<T = SupabaseRecord>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    try {
      if (!this.initialized) {
        return { id, ...data } as T;
      }

      const { data: result, error } = await this.getClient()
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase update error: ${error.message}`);
      }

      return result as T;
    } catch (error) {
      console.error('Failed to update record in Supabase:', error);
      throw error;
    }
  }

  async delete(table: string, id: string | number): Promise<void> {
    try {
      if (!this.initialized) {
        return; // Mock deletion
      }

      const { error } = await this.getClient()
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Supabase delete error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete record from Supabase:', error);
      throw error;
    }
  }

  subscribe<T = SupabaseRecord>(
    table: string,
    callback: (payload: { eventType: string; new: T | null; old: T | null }) => void,
    filter?: string
  ) {
    if (!this.initialized) {
      console.warn('Supabase not initialized. Subscription not available.');
      return { unsubscribe: () => {} };
    }

    const channel = this.getClient()
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as T,
            old: payload.old as T,
          });
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        this.getClient().removeChannel(channel);
      },
    };
  }

  private getMockData(table: string): SupabaseRecord[] {
    // Mock data for development
    const mockData: Record<string, SupabaseRecord[]> = {
      users: [
        { id: 1, email: 'user@example.com', name: 'Test User', role: 'admin' },
        { id: 2, email: 'user2@example.com', name: 'Test User 2', role: 'user' },
      ],
      projects: [
        { id: 1, name: 'Project 1', status: 'active', created_at: new Date().toISOString() },
        { id: 2, name: 'Project 2', status: 'pending', created_at: new Date().toISOString() },
      ],
    };

    return mockData[table] || [];
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const supabaseService = new SupabaseService();


