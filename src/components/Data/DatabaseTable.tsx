// Database Table Component
// Displays database records in a sortable, filterable table

import React, { useState, useMemo } from 'react';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

export interface DatabaseTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  emptyMessage?: string;
  pagination?: {
    pageSize?: number;
    showPagination?: boolean;
  };
}

export function DatabaseTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  emptyMessage = 'No records found',
  pagination = { pageSize: 10, showPagination: true },
}: DatabaseTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = pagination.pageSize || 10;

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((record) =>
        columns.some((col) => {
          const value = record[col.key as keyof T];
          return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof T];
        const bVal = b[sortConfig.key as keyof T];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (sortConfig.direction === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [data, sortConfig, searchTerm, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = pagination.showPagination
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const renderValue = (column: Column<T>, record: T) => {
    const value = record[column.key as keyof T];
    if (column.render) {
      return column.render(value, record);
    }
    return value ?? '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-lemon"></div>
        <span className="ml-3 text-brand-text-muted">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg-secondary rounded-lg border border-brand-border overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-brand-border">
        <div className="relative">
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white placeholder-brand-text-dim focus:outline-none focus:border-brand-lemon focus:ring-1 focus:ring-brand-lemon"
          />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-text-dim"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-brand-bg-tertiary">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={`px-6 py-3 text-left text-xs font-medium text-brand-text-muted uppercase tracking-wider ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-brand-bg-secondary' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable !== false && sortConfig?.key === column.key && (
                      <span className="text-brand-lemon">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-brand-text-muted uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-6 py-12 text-center text-brand-text-dim"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((record) => (
                <tr
                  key={record.id}
                  className={`hover:bg-brand-bg-tertiary transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(record)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {renderValue(column, record)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(record)}
                            className="text-brand-lemon hover:text-brand-lemon-light transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(record)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.showPagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-brand-border flex items-center justify-between">
          <div className="text-sm text-brand-text-muted">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, processedData.length)} of{' '}
            {processedData.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-bg-secondary transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-brand-lemon text-black font-medium'
                        : 'bg-brand-bg-tertiary border border-brand-border text-white hover:bg-brand-bg-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-bg-secondary transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


