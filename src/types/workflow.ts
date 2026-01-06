// Workflow-related types

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: WorkflowParameter[];
  status: 'active' | 'inactive' | 'error';
  lastExecution?: ExecutionResult;
  webhookUrl?: string;
}

export interface WorkflowParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  default?: any;
}

export interface ExecutionResult {
  executionId: string;
  status: 'success' | 'error' | 'running';
  startedAt: string;
  finishedAt?: string;
  data?: any;
  error?: string;
}

export interface WorkflowStatus {
  workflowId: string;
  isRunning: boolean;
  lastExecution?: ExecutionResult;
  nextRun?: string;
}

export interface ExecutionHistory {
  executionId: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'error' | 'running';
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  data?: any;
  error?: string;
}


