// Database Viewer Component
// Main component that combines table, form, and dashboard for database management

import React, { useState } from 'react';
import { DatabaseTable, Column } from './DatabaseTable';
import { DatabaseForm, FormField } from './DatabaseForm';
import { DatabaseDashboard, DatabaseStat } from './DatabaseDashboard';
import { useSupabase } from '../../hooks/useSupabase';
import { useBaserow } from '../../hooks/useBaserow';

export type DatabaseType = 'supabase' | 'baserow';

export interface DatabaseViewerProps {
  type: DatabaseType;
  tableName: string;
  tableId?: string; // For Baserow
  columns: Column[];
  formFields: FormField[];
  title?: string;
}

export function DatabaseViewer({
  type,
  tableName,
  tableId,
  columns,
  formFields,
  title,
}: DatabaseViewerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('table');

  // Supabase hook
  const supabase = useSupabase({
    table: tableName,
    autoFetch: type === 'supabase',
    options: { limit: 100 },
  });

  // Baserow hook
  const baserow = useBaserow();

  const currentData = type === 'supabase' ? supabase.data : baserow.getCachedRecords(tableId || '');
  const loading = type === 'supabase' ? supabase.loading : baserow.isLoading;

  // Stats for dashboard
  const stats: DatabaseStat[] = [
    {
      label: 'Total Records',
      value: currentData?.length || 0,
      color: 'lemon',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Status',
      value: loading ? 'Loading...' : 'Active',
      color: 'forest',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Database',
      value: type === 'supabase' ? 'Supabase' : 'Baserow',
      color: 'mint',
    },
    {
      label: 'Last Sync',
      value: new Date().toLocaleDateString(),
      color: 'lemon',
    },
  ];

  const handleCreate = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = async (record: any) => {
    if (!confirm(`Are you sure you want to delete this record?`)) {
      return;
    }

    try {
      if (type === 'supabase') {
        await supabase.remove(record.id);
      } else if (tableId) {
        await baserow.deleteRecord(tableId, Number(record.id));
        await baserow.syncTable(tableId);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete record');
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (type === 'supabase') {
        if (editingRecord) {
          await supabase.update(editingRecord.id, data);
        } else {
          await supabase.create(data);
        }
      } else if (tableId) {
        if (editingRecord) {
          await baserow.updateRecord(tableId, Number(editingRecord.id), data);
        } else {
          await baserow.createRecord(tableId, data);
        }
        await baserow.syncTable(tableId);
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Form submit error:', error);
      throw error;
    }
  };

  const handleSync = async () => {
    if (type === 'baserow' && tableId) {
      await baserow.syncTable(tableId);
    } else if (type === 'supabase') {
      await supabase.fetch();
    }
  };

  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <DatabaseForm
          fields={formFields}
          initialData={editingRecord}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
          submitLabel={editingRecord ? 'Update' : 'Create'}
          title={editingRecord ? `Edit ${title || 'Record'}` : `Create New ${title || 'Record'}`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard View */}
      {viewMode === 'dashboard' && (
        <DatabaseDashboard
          title={title || `${type === 'supabase' ? 'Supabase' : 'Baserow'} Database`}
          stats={stats}
          actions={[
            {
              label: 'View Table',
              onClick: () => setViewMode('table'),
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              label: 'Sync',
              onClick: handleSync,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
            },
            {
              label: 'Create New',
              onClick: handleCreate,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ),
            },
          ]}
        />
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-white gradient-text">
              {title || `${type === 'supabase' ? 'Supabase' : 'Baserow'} Table`}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('dashboard')}
                className="px-4 py-2 border border-brand-border rounded-lg text-white hover:bg-brand-bg-tertiary transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleSync}
                disabled={loading}
                className="px-4 py-2 border border-brand-border rounded-lg text-white hover:bg-brand-bg-tertiary transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Sync</span>
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-brand-lemon text-black rounded-lg font-medium hover:bg-brand-lemon-light transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New</span>
              </button>
            </div>
          </div>

          <DatabaseTable
            data={currentData || []}
            columns={columns}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={{ pageSize: 20, showPagination: true }}
          />
        </>
      )}
    </div>
  );
}


