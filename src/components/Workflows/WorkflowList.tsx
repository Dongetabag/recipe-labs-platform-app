// Workflow List Component - Displays all n8n workflows
import React, { useState } from 'react';
import { useWorkflows } from '../../hooks/useWorkflows.js';
import { Workflow } from '../../types/workflow.js';

interface WorkflowListProps {
  onSelectWorkflow?: (workflow: Workflow) => void;
  onExecuteWorkflow?: (workflow: Workflow) => void;
}

export default function WorkflowList({
  onSelectWorkflow,
  onExecuteWorkflow,
}: WorkflowListProps) {
  const { workflows, isLoading } = useWorkflows();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', ...Array.from(new Set(workflows.map(w => w.category)))];

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesCategory = selectedCategory === 'All' || workflow.category === selectedCategory;
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-lemon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-brand-bg-tertiary border border-brand-border rounded-lg px-4 py-2 text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-lemon"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-brand-bg-tertiary border border-brand-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-lemon"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.map(workflow => (
          <div
            key={workflow.id}
            className="bg-brand-bg-tertiary border border-brand-border rounded-lg p-4 hover:border-brand-lemon transition cursor-pointer"
            onClick={() => onSelectWorkflow?.(workflow)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-white">{workflow.name}</h3>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.status)}`}></div>
            </div>
            <p className="text-sm text-brand-text-muted mb-3">{workflow.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-text-muted">{workflow.category}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExecuteWorkflow?.(workflow);
                }}
                className="px-3 py-1 bg-brand-lemon text-brand-bg rounded text-sm font-semibold hover:bg-brand-lemon-light transition"
              >
                Execute
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12 text-brand-text-muted">
          No workflows found
        </div>
      )}
    </div>
  );
}

