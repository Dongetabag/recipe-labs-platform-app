// Workflow Executor Component - Executes workflows with parameters
import React, { useState } from 'react';
import { useWorkflows } from '../../hooks/useWorkflows.js';
import { Workflow, WorkflowParameter } from '../../types/workflow.js';

interface WorkflowExecutorProps {
  workflow: Workflow;
  onClose: () => void;
  onComplete?: (result: any) => void;
}

export default function WorkflowExecutor({
  workflow,
  onClose,
  onComplete,
}: WorkflowExecutorProps) {
  const { executeWorkflow, isLoading } = useWorkflows();
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParameterChange = (name: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExecute = async () => {
    setError(null);
    setResult(null);

    try {
      const executionResult = await executeWorkflow(workflow.id, parameters);
      setResult(executionResult);
      onComplete?.(executionResult);
    } catch (err: any) {
      setError(err.message || 'Workflow execution failed');
    }
  };

  const renderParameterInput = (param: WorkflowParameter) => {
    switch (param.type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={parameters[param.name] || false}
            onChange={(e) => handleParameterChange(param.name, e.target.checked)}
            className="w-4 h-4"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={parameters[param.name] || param.default || ''}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
            className="w-full bg-brand-bg-tertiary border border-brand-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-lemon"
          />
        );
      case 'object':
      case 'array':
        return (
          <textarea
            value={JSON.stringify(parameters[param.name] || param.default || {}, null, 2)}
            onChange={(e) => {
              try {
                handleParameterChange(param.name, JSON.parse(e.target.value));
              } catch {
                // Invalid JSON, ignore
              }
            }}
            className="w-full bg-brand-bg-tertiary border border-brand-border rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-brand-lemon"
            rows={4}
          />
        );
      default:
        return (
          <input
            type="text"
            value={parameters[param.name] || param.default || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full bg-brand-bg-tertiary border border-brand-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-lemon"
          />
        );
    }
  };

  return (
    <div className="bg-brand-bg-secondary border border-brand-border rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Execute Workflow</h2>
        <button
          onClick={onClose}
          className="text-brand-text-muted hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-white mb-1">{workflow.name}</h3>
        <p className="text-sm text-brand-text-muted">{workflow.description}</p>
      </div>

      {workflow.parameters.length > 0 && (
        <div className="space-y-4 mb-6">
          {workflow.parameters.map(param => (
            <div key={param.name}>
              <label className="block text-sm font-medium text-white mb-2">
                {param.name}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {param.description && (
                <p className="text-xs text-brand-text-muted mb-1">{param.description}</p>
              )}
              {renderParameterInput(param)}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg">
          <p className="text-green-400 font-semibold mb-2">Execution Successful</p>
          <pre className="text-xs text-white overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleExecute}
          disabled={isLoading || workflow.parameters.some(p => p.required && !parameters[p.name])}
          className="flex-1 px-4 py-2 bg-brand-lemon text-brand-bg rounded-lg font-semibold hover:bg-brand-lemon-light disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Executing...' : 'Execute Workflow'}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white hover:bg-brand-bg transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

