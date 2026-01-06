// Hook for Recipe Labs Agent integration
import { useState, useCallback, useEffect } from 'react';
import { agentService, AgentContext, AgentResponse } from '../services/agentService.js';
import { Conversation, Message, Suggestion } from '../types/agent';

export function useAgent(userProfile?: any, currentState?: any) {
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());
  const [activeContext, setActiveContext] = useState<AgentContext>({});
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Build context from current state
  const buildContext = useCallback((): AgentContext => {
    return {
      currentPage: currentState?.currentPage,
      activeTool: currentState?.selectedTool,
      selectedData: currentState?.selectedData,
      userProfile: userProfile ? {
        name: userProfile.name,
        role: userProfile.role,
        department: userProfile.department,
        specialization: userProfile.specialization,
      } : undefined,
      workflowStatus: currentState?.activeWorkflows,
      baserowData: currentState?.activeBaserowRecords,
    };
  }, [userProfile, currentState]);

  // Check agent health
  useEffect(() => {
    agentService.getHealth()
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));
  }, []);

  // Send message to agent
  const sendMessage = useCallback(async (
    message: string,
    conversationId?: string
  ): Promise<AgentResponse> => {
    setIsLoading(true);
    const context = buildContext();
    setActiveContext(context);

    try {
      const response = await agentService.chat(message, context);

      // Update conversation
      const convId = conversationId || `conv-${Date.now()}`;
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
        source: response.source,
        responseTime: response.responseTime,
      };

      setConversations(prev => {
        const updated = new Map(prev);
        const existing = updated.get(convId) || {
          id: convId,
          messages: [],
          context,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updated.set(convId, {
          ...existing,
          messages: [...existing.messages, userMessage, assistantMessage],
          updatedAt: new Date().toISOString(),
        });

        return updated;
      });

      return response;
    } catch (error) {
      console.error('Agent message failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [buildContext]);

  // Get conversation
  const getConversation = useCallback((conversationId: string): Conversation | undefined => {
    return conversations.get(conversationId);
  }, [conversations]);

  // Clear conversation
  const clearConversation = useCallback((conversationId: string) => {
    setConversations(prev => {
      const updated = new Map(prev);
      updated.delete(conversationId);
      return updated;
    });
  }, []);

  // Generate suggestions based on context
  useEffect(() => {
    if (activeContext.currentPage) {
      const contextSuggestions: Suggestion[] = [
        {
          id: 'suggest-1',
          text: `Help me with ${activeContext.currentPage}`,
          category: 'contextual',
        },
        {
          id: 'suggest-2',
          text: 'Show me available workflows',
          category: 'workflow',
        },
        {
          id: 'suggest-3',
          text: 'What data do we have?',
          category: 'data',
        },
      ];
      setSuggestions(contextSuggestions);
    }
  }, [activeContext]);

  return {
    conversations: Array.from(conversations.values()),
    activeContext,
    isLoading,
    suggestions,
    isConnected,
    sendMessage,
    getConversation,
    clearConversation,
    buildContext,
  };
}

