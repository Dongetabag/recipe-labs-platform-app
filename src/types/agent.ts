// Agent-related types

export interface Conversation {
  id: string;
  messages: Message[];
  context: AgentContext;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'n8n' | 'claude-cli' | 'google-ai' | 'error';
  responseTime?: number;
}

export interface AgentContext {
  currentPage?: string;
  activeTool?: string;
  selectedData?: any;
  userProfile?: {
    name: string;
    role: string;
    department: string;
    specialization: string;
  };
  workflowStatus?: any[];
  baserowData?: any[];
}

export interface Suggestion {
  id: string;
  text: string;
  action?: () => void;
  category?: string;
}

export interface AgentState {
  conversations: Map<string, Conversation>;
  activeContext: AgentContext;
  isLoading: boolean;
  suggestions: Suggestion[];
  isConnected: boolean;
}


