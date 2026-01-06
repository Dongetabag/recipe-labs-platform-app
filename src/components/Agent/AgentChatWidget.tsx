// Floating Agent Chat Widget - Always accessible
import React, { useState, useRef, useEffect } from 'react';
import { useAgent } from '../../hooks/useAgent.js';
import { Message } from '../../types/agent.js';

interface AgentChatWidgetProps {
  userProfile?: any;
  currentState?: any;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function AgentChatWidget({
  userProfile,
  currentState,
  position = 'bottom-right',
}: AgentChatWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [input, setInput] = useState('');
  const [conversationId] = useState(`widget-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    isLoading,
    suggestions,
    isConnected,
    sendMessage,
    getConversation,
  } = useAgent(userProfile, currentState);

  const conversation = getConversation(conversationId);
  const messages = conversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');

    try {
      await sendMessage(messageText, conversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={`fixed ${positionClasses[position]} z-50 w-14 h-14 bg-brand-lemon rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group`}
        title="Open Recipe Labs Agent"
      >
        <div className="w-8 h-8 bg-brand-forest rounded-full flex items-center justify-center text-white font-bold">
          RL
        </div>
        {!isConnected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 w-96 h-[600px] bg-brand-bg-secondary border border-brand-border rounded-lg shadow-2xl flex flex-col`}
    >
      {/* Header */}
      <div className="bg-brand-bg-tertiary px-4 py-3 rounded-t-lg flex items-center justify-between border-b border-brand-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-lemon to-brand-forest rounded-full flex items-center justify-center text-white font-bold text-sm">
            RL
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Recipe Labs Agent</h3>
            <p className="text-xs text-brand-text-muted">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-brand-text-muted hover:text-white transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-brand-text-muted text-sm mb-4">
              Ask me anything about Recipe Labs operations!
            </p>
            {suggestions.length > 0 && (
              <div className="space-y-2">
                {suggestions.slice(0, 3).map(suggestion => (
                  <button
                    key={suggestion.id}
                    onClick={() => setInput(suggestion.text)}
                    className="block w-full text-left px-3 py-2 bg-brand-bg-tertiary rounded-lg text-sm text-brand-text-muted hover:text-white hover:bg-brand-bg transition"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-brand-lemon text-brand-bg'
                  : 'bg-brand-bg-tertiary text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.source && message.role === 'assistant' && (
                <p className="text-xs mt-1 opacity-70">
                  {message.source} • {message.responseTime}ms
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-brand-bg-tertiary rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-brand-lemon rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-lemon rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-brand-lemon rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-brand-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-brand-bg-tertiary border border-brand-border rounded-lg px-3 py-2 text-sm text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-lemon"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-brand-lemon text-brand-bg rounded-lg font-semibold hover:bg-brand-lemon-light disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

