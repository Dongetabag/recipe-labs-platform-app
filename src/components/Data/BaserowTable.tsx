// Baserow Table Component - Displays and manages Baserow table data
import React, { useState, useEffect } from 'react';
import { useBaserow } from '../../hooks/useBaserow.js';
import { BaserowRecord, Filter } from '../../types/baserow.js';

interface BaserowTableProps {
  tableId: string;
  tableName: string;
  fields?: string[];
  onRecordSelect?: (record: BaserowRecord) => void;
}

export default function BaserowTable({
  tableId,
  tableName,
  fields,
  onRecordSelect,
}: BaserowTableProps) {
  const { syncTable, getCachedRecords, isLoading } = useBaserow();
  const [records, setRecords] = useState<BaserowRecord[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadData();
  }, [tableId]);

  const loadData = async () => {
    try {
      const data = await syncTable(tableId);
      setRecords(data);
    } catch (error) {
      console.error('Failed to load table data:', error);
      // Fallback to cached data
      const cached = getCachedRecords(tableId);
      setRecords(cached);
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredRecords = sortedRecords.filter(record => {
    return filters.every(filter => {
      const value = record[filter.field];
      switch (filter.operator) {
        case 'equal':
          return value === filter.value;
        case 'not_equal':
          return value !== filter.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'not_contains':
          return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'greater_than':
          return Number(value) > Number(filter.value);
        case 'less_than':
          return Number(value) < Number(filter.value);
        default:
          return true;
      }
    });
  });

  const recordFields = fields || (records.length > 0 ? Object.keys(records[0]).filter(k => k !== 'id') : []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading && records.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-lemon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{tableName}</h2>
        <button
          onClick={loadData}
          className="px-3 py-1 bg-brand-lemon text-brand-bg rounded text-sm font-semibold hover:bg-brand-lemon-light transition"
        >
          Refresh
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 text-brand-text-muted">
          No records found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-brand-border">
                {recordFields.map(field => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-4 py-3 text-left text-sm font-semibold text-white cursor-pointer hover:bg-brand-bg-tertiary transition"
                  >
                    <div className="flex items-center gap-2">
                      {field}
                      {sortBy === field && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr
                  key={record.id}
                  onClick={() => onRecordSelect?.(record)}
                  className="border-b border-brand-border hover:bg-brand-bg-tertiary cursor-pointer transition"
                >
                  {recordFields.map(field => (
                    <td key={field} className="px-4 py-3 text-sm text-brand-text-muted">
                      {String(record[field] || '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-sm text-brand-text-muted">
        Showing {filteredRecords.length} of {records.length} records
      </div>
    </div>
  );
}

