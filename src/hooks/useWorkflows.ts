// Hook for n8n workflow management
import { useState, useCallback, useEffect } from 'react';
import { n8nService, Workflow, ExecutionResult, WorkflowStatus } from '../services/n8nService.js';
import { ExecutionHistory } from '../types/workflow';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<ExecutionResult[]>([]);
  const [history, setHistory] = useState<ExecutionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load workflows
  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const workflowList = await n8nService.listWorkflows();
      setWorkflows(workflowList);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Execute workflow
  const executeWorkflow = useCallback(async (
    workflowId: string,
    parameters: Record<string, any> = {}
  ): Promise<ExecutionResult> => {
    setIsLoading(true);
    try {
      const result = await n8nService.executeWorkflow(workflowId, parameters);
      
      // Add to active executions if running
      if (result.status === 'running') {
        setActiveExecutions(prev => [...prev, result]);
      }

      // Add to history
      const workflow = workflows.find(w => w.id === workflowId);
      const historyItem: ExecutionHistory = {
        executionId: result.executionId,
        workflowId,
        workflowName: workflow?.name || workflowId,
        status: result.status,
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
        duration: result.finishedAt && result.startedAt
          ? new Date(result.finishedAt).getTime() - new Date(result.startedAt).getTime()
          : undefined,
        data: result.data,
        error: result.error,
      };

      setHistory(prev => [historyItem, ...prev].slice(0, 100)); // Keep last 100

      return result;
    } catch (error) {
      console.error('Workflow execution failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [workflows]);

  // Get workflow status
  const getWorkflowStatus = useCallback(async (workflowId: string): Promise<WorkflowStatus> => {
    try {
      return await n8nService.getWorkflowStatus(workflowId);
    } catch (error) {
      console.error('Failed to get workflow status:', error);
      throw error;
    }
  }, []);

  // Load workflows on mount
  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  return {
    workflows,
    activeExecutions,
    history,
    isLoading,
    loadWorkflows,
    executeWorkflow,
    getWorkflowStatus,
  };
}

