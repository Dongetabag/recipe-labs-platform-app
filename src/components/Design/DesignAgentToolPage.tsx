// Design Agent Tool Page
// Matches the style of other tool pages but handles design generation

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Tool, ChatMessage } from '../../types.ts';
import { ArrowLeft, Send, AILoader, Sparkles, AlertTriangle, Paperclip, X, FileText, Save, Loader, Check, Copy, ThumbsUp, ThumbsDown } from '../../../components/icons.tsx';
import { designAgentService, DesignPrompt } from '../../services/designAgentService';

interface DesignAgentToolPageProps {
  user: UserProfile | null;
  selectedTool: Tool;
  chatHistories: { [key: string]: ChatMessage[] };
  onNavigate: (page: 'dashboard') => void;
  onUseTool: (toolId: string, userPrompt: string, modelResponse: string) => void;
  onSetSatisfaction: (toolId: string, messageIndex: number, satisfaction: 'satisfied' | 'unsatisfied') => void;
}

export const DesignAgentToolPage: React.FC<DesignAgentToolPageProps> = ({
  user,
  selectedTool,
  chatHistories,
  onNavigate,
  onUseTool,
  onSetSatisfaction,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState<number | null>(null);
  const [promptExamples, setPromptExamples] = useState<string[]>([]);
  const [savingState, setSavingState] = useState<{ index: number; status: 'saving' | 'saved' | 'error' } | null>(null);
  const [formData, setFormData] = useState<DesignPrompt>({
    type: selectedTool.id === 'flyer-generator' ? 'flyer' : 'instagram',
    title: '',
    description: '',
    callToAction: selectedTool.id === 'flyer-generator' ? 'Get Started' : 'Learn More',
    colorScheme: 'gradient',
    style: 'modern',
    additionalInstructions: '',
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentChatHistory = chatHistories[selectedTool.id] || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatHistory, isLoading]);

  useEffect(() => {
    if (selectedTool.promptExamples) {
      if (typeof selectedTool.promptExamples === 'function' && user) {
        setPromptExamples(selectedTool.promptExamples(user));
      } else if (Array.isArray(selectedTool.promptExamples)) {
        setPromptExamples(selectedTool.promptExamples);
      }
    } else {
      setPromptExamples([]);
    }
    setPrompt('');
  }, [selectedTool, user]);

  const handleDownload = (content: string, index: number) => {
    setSavingState({ index, status: 'saving' });
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RecipeLabs-${selectedTool.name.replace(/\s/g, '_')}-${new Date().toISOString()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSavingState({ index, status: 'saved' });
      setTimeout(() => setSavingState(null), 2000);
    } catch (err) {
      console.error("Download failed", err);
      setError("Could not prepare the file for download.");
      setSavingState({ index, status: 'error' });
      setTimeout(() => setSavingState(null), 3000);
    }
  };

  const handleGenerate = async () => {
    if ((!prompt.trim() && !formData.title && !formData.description) || isLoading || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      // If user provided a simple prompt, use it as description
      const designPrompt: DesignPrompt = {
        ...formData,
        description: prompt || formData.description,
        title: formData.title || prompt.split('.')[0] || 'Recipe Labs',
      };

      const generated = await designAgentService.generateImage(designPrompt);
      
      // Format response with image if available
      let responseText = `# Generated ${designPrompt.type === 'flyer' ? 'Flyer' : 'Instagram Post'} Design\n\n`;
      
      if (generated.url || generated.base64) {
        const imageUrl = generated.url || `data:image/png;base64,${generated.base64}`;
        responseText += `![Generated Design](${imageUrl})\n\n`;
      }
      
      responseText += `## Design Details\n\n${generated.prompt}\n\n---\n\n*Generated at: ${new Date(generated.timestamp).toLocaleString()}*`;

      onUseTool(selectedTool.id, prompt || `Generate ${formData.type}`, responseText);
      setPrompt('');
      setFormData({
        type: formData.type,
        title: '',
        description: '',
        callToAction: formData.callToAction,
        colorScheme: 'gradient',
        style: 'modern',
        additionalInstructions: '',
      });
    } catch (e: any) {
      console.error(e);
      setError(`An error occurred: ${e.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(index);
    setTimeout(() => setCopiedResponse(null), 2000);
  };

  const handleSetSatisfaction = (index: number, satisfaction: 'satisfied' | 'unsatisfied') => {
    onSetSatisfaction(selectedTool.id, index, satisfaction);
  };

  const renderFormattedResponse = (text: string): React.ReactNode => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const parts = text.split(codeBlockRegex);

    return (
      <div>
        {parts.map((part, partIndex) => {
          if (partIndex % 2 === 1) {
            const codeContent = part.split('\n').slice(1).join('\n');
            return (
              <pre key={partIndex} className="bg-brand-bg-tertiary p-3 font-mono text-sm my-2 block overflow-x-auto border border-brand-border rounded-lg text-brand-text-muted">
                <code>{codeContent || part}</code>
              </pre>
            );
          }

          // Process images first
          const imageMatches = [...part.matchAll(imageRegex)];
          if (imageMatches.length > 0) {
            const elements: React.ReactNode[] = [];
            let lastIndex = 0;
            
            imageMatches.forEach((match, matchIndex) => {
              const beforeImage = part.substring(lastIndex, match.index || 0);
              if (beforeImage) {
                elements.push(...renderTextContent(beforeImage, partIndex));
              }
              
              const altText = match[1];
              const imageUrl = match[2];
              elements.push(
                <div key={`img-${partIndex}-${matchIndex}`} className="my-4">
                  <img 
                    src={imageUrl} 
                    alt={altText || 'Generated Design'} 
                    className="max-w-full h-auto rounded-lg border border-brand-border"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
              );
              
              lastIndex = (match.index || 0) + match[0].length;
            });
            
            const afterLastImage = part.substring(lastIndex);
            if (afterLastImage) {
              elements.push(...renderTextContent(afterLastImage, partIndex));
            }
            
            return <React.Fragment key={partIndex}>{elements}</React.Fragment>;
          }

          return <React.Fragment key={partIndex}>{renderTextContent(part, partIndex)}</React.Fragment>;
        })}
      </div>
    );
  };

  const renderTextContent = (text: string, index: number): React.ReactNode[] => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const lines = text.split('\n').map((line, lineIndex) => {
      if (line.trim() === '') return null;

      if (line.startsWith('# ')) {
        const content = line.substring(2);
        return <h1 key={`${index}-${lineIndex}`} className="text-xl font-bold my-3 pt-2 font-orbitron text-white">{content}</h1>;
      }
      if (line.startsWith('## ')) {
        const content = line.substring(3);
        return <h2 key={`${index}-${lineIndex}`} className="text-lg font-semibold my-2 pt-1 font-orbitron text-white">{content}</h2>;
      }

      if (line.trim().startsWith('- ')) {
        const content = line.trim().substring(2);
        const formattedContent = content.split(boldRegex).map((subPart, i) =>
          i % 2 === 1 ? <strong key={i} className="font-bold text-brand-lemon">{subPart}</strong> : subPart
        );
        return <li key={`${index}-${lineIndex}`}>{formattedContent}</li>;
      }

      const formattedLine = line.split(boldRegex).map((subPart, i) =>
        i % 2 === 1 ? <strong key={i} className="font-bold text-brand-lemon">{subPart}</strong> : subPart
      );
      return <p key={`${index}-${lineIndex}`} className="my-1">{formattedLine}</p>;
    }).filter(Boolean);

    const groupedElements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    for (const line of lines) {
      if (React.isValidElement(line) && line.type === 'li') {
        currentList.push(line);
      } else {
        if (currentList.length > 0) {
          groupedElements.push(<ul key={`ul-${index}-${groupedElements.length}`} className="list-disc list-inside space-y-1 my-2 pl-2">{currentList}</ul>);
          currentList = [];
        }
        groupedElements.push(line);
      }
    }
    if (currentList.length > 0) {
      groupedElements.push(<ul key={`ul-end-${index}`} className="list-disc list-inside space-y-1 my-2 pl-2">{currentList}</ul>);
    }

    return groupedElements;
  };

  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col relative overflow-hidden">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 tech-grid-bg opacity-20 pointer-events-none" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-lemon/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-forest/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="relative z-40 bg-brand-bg-secondary/80 backdrop-blur-md border-b border-brand-border flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-brand-text-muted hover:text-brand-lemon transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-tech">Dashboard</span>
            </button>
            <div
              className="p-2.5 rounded-lg text-white"
              style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}
            >
              {selectedTool.icon}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-30 flex-grow flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-orbitron">{selectedTool.name}</h1>
          <p className="text-brand-text-muted mt-1 text-sm sm:text-base font-tech">{selectedTool.description}</p>
        </div>

        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 pb-4">
          {currentChatHistory.map((msg, index) => (
            <div key={index} className={`flex gap-2 sm:gap-4 animate-slideInUp ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div
                  className="p-2.5 h-fit rounded-lg text-white"
                  style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
              <div className={`w-full max-w-xl p-4 border rounded-xl ${msg.role === 'model' ? 'bg-brand-bg-secondary border-brand-border text-brand-text-muted' : 'bg-brand-lemon/10 border-brand-lemon/30 text-white'}`}>
                {msg.role === 'user' ? (
                  <p>{msg.text}</p>
                ) : (
                  renderFormattedResponse(msg.text)
                )}

                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mt-3 -mb-1 border-t border-brand-border pt-2">
                    <button onClick={() => handleCopy(msg.text, index)} className="p-2 text-brand-text-dim hover:text-brand-lemon hover:bg-brand-bg-tertiary rounded-md transition-colors" title="Copy response">
                      {copiedResponse === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleSetSatisfaction(index, 'satisfied')} className={`p-2 rounded-md transition-colors ${msg.satisfaction === 'satisfied' ? 'text-green-500 bg-brand-bg-tertiary' : 'text-brand-text-dim hover:text-brand-lemon hover:bg-brand-bg-tertiary'}`} title="Good response">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleSetSatisfaction(index, 'unsatisfied')} className={`p-2 rounded-md transition-colors ${msg.satisfaction === 'unsatisfied' ? 'text-red-500 bg-brand-bg-tertiary' : 'text-brand-text-dim hover:text-brand-lemon hover:bg-brand-bg-tertiary'}`} title="Bad response">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(msg.text, index)}
                      className="p-2 text-brand-text-dim hover:text-brand-lemon hover:bg-brand-bg-tertiary rounded-md transition-colors"
                      title="Download response"
                    >
                      {savingState?.index === index ? (
                        savingState.status === 'saving' ? <Loader className="w-4 h-4 animate-spin" /> :
                        savingState.status === 'saved' ? <Check className="w-4 h-4 text-green-500" /> :
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-full text-white font-bold"
                  style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}
                >
                  <span>{user?.name?.[0]}</span>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 animate-slideInUp">
              <div
                className="p-2.5 h-fit rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}
              >
                <AILoader className="w-5 h-5" />
              </div>
              <div className="w-full max-w-xl p-4 border bg-brand-bg-secondary border-brand-border text-brand-text-muted rounded-xl">
                <span className="font-tech">GENERATING DESIGN...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Footer Input */}
      <footer className="relative z-40 mt-auto flex-shrink-0 bg-brand-bg-secondary/80 backdrop-blur-md border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 mb-4 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          {promptExamples.length > 0 && currentChatHistory.length === 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar scroll-snap-x-mandatory scroll-pl-4">
              {promptExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="flex-shrink-0 px-4 py-2 bg-brand-bg-tertiary border border-brand-border text-brand-text-muted text-xs hover:bg-brand-border hover:border-brand-lemon/30 hover:text-brand-lemon transition-colors scroll-snap-align-start rounded-full font-tech"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              placeholder="Enter directive... (Shift+Enter for newline)"
              className="w-full bg-brand-bg-tertiary border-2 border-brand-border p-4 pl-12 pr-20 sm:pl-14 sm:pr-24 text-white placeholder-brand-text-dim resize-none focus:ring-2 focus:ring-brand-lemon/50 focus:border-brand-lemon/50 transition-all font-tech rounded-xl max-h-36"
              rows={1}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Paperclip className="w-5 h-5 text-brand-text-dim" />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-brand-bg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all rounded-lg"
              style={{ background: 'linear-gradient(135deg, #F5D547 0%, #D4B83A 100%)' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Brand Spectrum Bar */}
      <div className="brand-spectrum" />
    </div>
  );
};

