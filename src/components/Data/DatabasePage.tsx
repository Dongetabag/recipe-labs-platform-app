// Database Page Component
// Main page for database management with tabs for Supabase and Baserow

import React, { useState } from 'react';
import { DatabaseViewer } from './DatabaseViewer';
import { Column } from './DatabaseTable';
import { FormField } from './DatabaseForm';

interface DatabasePageProps {
  onNavigate?: (page: string) => void;
}

export function DatabasePage({ onNavigate }: DatabasePageProps) {
  const [activeTab, setActiveTab] = useState<'supabase' | 'baserow'>('baserow');

  // Baserow columns (example - adjust based on your table structure)
  const baserowColumns: Column[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'created_at', label: 'Created', sortable: true },
  ];

  // Baserow form fields
  const baserowFormFields: FormField[] = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter name' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
    },
  ];

  // Supabase columns (example - adjust based on your table structure)
  const supabaseColumns: Column[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'created_at', label: 'Created', sortable: true },
  ];

  // Supabase form fields
  const supabaseFormFields: FormField[] = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter name' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email' },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
        { value: 'guest', label: 'Guest' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white hover:bg-brand-bg-secondary hover:border-brand-lemon transition-colors"
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-tech">Dashboard</span>
              </button>
            )}
          </div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Database Management</h1>
          <p className="text-brand-text-muted">Manage your Supabase and Baserow databases</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-brand-border">
          <button
            onClick={() => setActiveTab('baserow')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'baserow'
                ? 'border-brand-lemon text-brand-lemon'
                : 'border-transparent text-brand-text-muted hover:text-white'
            }`}
          >
            Baserow
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'supabase'
                ? 'border-brand-lemon text-brand-lemon'
                : 'border-transparent text-brand-text-muted hover:text-white'
            }`}
          >
            Supabase
          </button>
        </div>

        {/* Content */}
        {activeTab === 'baserow' && (
          <DatabaseViewer
            type="baserow"
            tableName="leads"
            tableId="789729"
            columns={baserowColumns}
            formFields={baserowFormFields}
            title="Baserow Leads Table"
          />
        )}

        {activeTab === 'supabase' && (
          <DatabaseViewer
            type="supabase"
            tableName="users"
            columns={supabaseColumns}
            formFields={supabaseFormFields}
            title="Supabase Users Table"
          />
        )}
      </div>
    </div>
  );
}

