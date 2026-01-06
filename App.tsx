import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import ToolPage from './components/ToolPage.tsx';
import RecipeRunner from './components/RecipeRunner.tsx';
import IntakeModal, { IntakeData } from './components/IntakeModal.tsx';
import ProfileModal from './components/ProfileModal.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import LevelUpModal from './components/LevelUpModal.tsx';
import AgentChatWidget from './src/components/Agent/AgentChatWidget.tsx';
import { DatabasePage } from './src/components/Data/DatabasePage.tsx';
import { DesignAgentToolPage } from './src/components/Design/DesignAgentToolPage.tsx';
import MediaAgentPage from './src/components/Media/MediaAgentPage.tsx';
import { UserProfile, Tool, ChatMessage, Recipe } from './types.ts';
import { ALL_TOOLS } from './constants.tsx';
import { usePlatformStore } from './src/store/platformStore';

type Page = 'landing' | 'dashboard' | 'tool' | 'recipe' | 'workflows' | 'data' | 'agent' | 'design' | 'media';

const THEME_COLORS: { [key: string]: string } = {
  violet: '#6A44FF',
  blue: '#1E3AFF',
  green: '#4FFF7B',
  aqua: '#2BFFC2',
};

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [animationState, setAnimationState] = useState<'in' | 'out'>('in');
  const [nextPage, setNextPage] = useState<Page | null>(null);

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [chatHistories, setChatHistories] = useState<{ [key: string]: ChatMessage[] }>({});
  const [toolStats, setToolStats] = useState<{ [key: string]: { usage: number } }>({});
  
  // V2 Platform Store
  const platformState = usePlatformStore();
  
  // Modal states
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  useEffect(() => {
    // Check local storage for user data to persist session
    const savedUser = localStorage.getItem('userProfile');
    const savedStats = localStorage.getItem('toolStats');
    const savedHistories = localStorage.getItem('chatHistories');

    if (savedUser) {
      setUserProfile(JSON.parse(savedUser));
      setToolStats(savedStats ? JSON.parse(savedStats) : {});
      setChatHistories(savedHistories ? JSON.parse(savedHistories) : {});
      setCurrentPage('dashboard');
    }
  }, []);
  
  useEffect(() => {
    if (userProfile) {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('toolStats', JSON.stringify(toolStats));
        localStorage.setItem('chatHistories', JSON.stringify(chatHistories));

        // Apply theme mode
        if (userProfile.themeMode === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }
  }, [userProfile, toolStats, chatHistories]);

  useEffect(() => {
    if (userProfile?.platformTheme) {
      const theme = userProfile.platformTheme;
      // Resolve theme name to hex, or use theme directly if it's already a hex code
      const color = THEME_COLORS[theme] || theme;
      
      const hexToRgb = (hex: string) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }

      const rgb = hexToRgb(color);

      if (rgb) {
        document.documentElement.style.setProperty('--accent-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        document.documentElement.style.setProperty('--accent-color', color);
      }
    }
  }, [userProfile?.platformTheme]);
  
  const handleNavigate = (page: Page) => {
    if (page !== currentPage) {
      // Handle design page - automatically select first design tool
      if (page === 'design' && userProfile) {
        const designTools = ALL_TOOLS.filter(t => t.id === 'flyer-generator' || t.id === 'instagram-post-generator');
        if (designTools.length > 0 && !selectedTool) {
          setSelectedTool(designTools[0]);
        }
      }
      setNextPage(page);
      setAnimationState('out');
    }
  };

  const handleAnimationEnd = () => {
    if (animationState === 'out' && nextPage) {
      // Handle design page - automatically select first design tool if none selected
      if (nextPage === 'design' && userProfile && !selectedTool) {
        const designTools = ALL_TOOLS.filter(t => t.id === 'flyer-generator' || t.id === 'instagram-post-generator');
        if (designTools.length > 0) {
          setSelectedTool(designTools[0]);
        }
      }
      setCurrentPage(nextPage);
      setAnimationState('in');
      setNextPage(null);
      if (nextPage === 'dashboard') {
        setSelectedTool(null);
        setSelectedRecipe(null);
      }
    }
  };
  
  const handleLogin = () => {
    setShowIntakeModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('toolStats');
    localStorage.removeItem('chatHistories');
    setUserProfile(null);
    setToolStats({});
    setChatHistories({});
    handleNavigate('landing');
  };

  const handleIntakeSubmit = (data: IntakeData) => {
    const newUser: UserProfile = {
      name: data.name,
      email: `${data.name.split(' ').join('.').toLowerCase()}@recipelabs.ai`,
      role: data.role,
      isPremium: true,
      credits: 1000,
      totalToolsUsed: 0,
      hasCompletedOnboarding: false,
      // Recipe Labs Team Member fields
      department: data.department,
      specialization: data.specialization,
      currentProjects: data.currentProjects,
      primaryFocus: data.primaryFocus,
      workStyle: data.workStyle,
      toolExpertise: data.toolExpertise,
      primaryGoals: data.primaryGoals,
      weeklyPriority: data.weeklyPriority,
      // UI Customization
      platformTheme: data.platformTheme,
      toolLayout: data.toolLayout,
      themeMode: 'dark', // Default to dark mode
    };
    setUserProfile(newUser);
    setShowIntakeModal(false);
    handleNavigate('dashboard');
  };

  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);
    handleNavigate('tool');
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    handleNavigate('recipe');
  };

  const handleUseTool = (toolId: string, userPrompt: string, modelResponse: string) => {
      const newChatMessageUser: ChatMessage = { role: 'user', text: userPrompt, timestamp: new Date().toISOString() };
      const newChatMessageModel: ChatMessage = { role: 'model', text: modelResponse, timestamp: new Date().toISOString() };

      setChatHistories(prev => {
          const history = prev[toolId] || [];
          const tool = ALL_TOOLS.find(t => t.id === toolId);
          if (tool && !tool.isConversational) {
              return { ...prev, [toolId]: [newChatMessageUser, newChatMessageModel] };
          }
          return { ...prev, [toolId]: [...history, newChatMessageUser, newChatMessageModel] };
      });
      
      setToolStats(prev => {
          const stats = prev[toolId] || { usage: 0 };
          return { ...prev, [toolId]: { usage: stats.usage + 1 } };
      });

      if (userProfile) {
          setUserProfile({
              ...userProfile,
              credits: userProfile.credits > 0 ? userProfile.credits - 1 : 0, // Simple credit usage
              totalToolsUsed: userProfile.totalToolsUsed + 1,
          });
      }
  };
  
  const handleSetSatisfaction = (toolId: string, messageIndex: number, satisfaction: 'satisfied' | 'unsatisfied') => {
      setChatHistories(prev => {
          const history = [...(prev[toolId] || [])];
          const message = history[messageIndex];
          if (message && message.role === 'model') {
              history[messageIndex] = { ...message, satisfaction };
          }
          return { ...prev, [toolId]: history };
      });
  };

  const handleUpdateUser = (updatedData: Partial<UserProfile>) => {
      if (userProfile) {
          setUserProfile(prev => prev ? { ...prev, ...updatedData } : null);
      }
  };
  
  const handleCompleteOnboarding = () => {
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, hasCompletedOnboarding: true } : null);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'recipe':
        return selectedRecipe ? (
          <RecipeRunner
            user={userProfile}
            selectedRecipe={selectedRecipe}
            onNavigate={() => handleNavigate('dashboard')}
            onUseTool={handleUseTool}
          />
        ) : null;
      case 'tool':
        return selectedTool ? (
          (selectedTool.id === 'flyer-generator' || selectedTool.id === 'instagram-post-generator') ? (
            <DesignAgentToolPage
              user={userProfile}
              selectedTool={selectedTool}
              chatHistories={chatHistories}
              onNavigate={() => handleNavigate('dashboard')}
              onUseTool={handleUseTool}
              onSetSatisfaction={handleSetSatisfaction}
            />
          ) : (
            <ToolPage
              user={userProfile}
              selectedTool={selectedTool}
              chatHistories={chatHistories}
              onNavigate={() => handleNavigate('dashboard')}
              onUseTool={handleUseTool}
              onSetSatisfaction={handleSetSatisfaction}
            />
          )
        ) : null;
      case 'dashboard':
        return userProfile ? (
          <Dashboard
            user={userProfile}
            toolStats={toolStats}
            onSelectTool={handleSelectTool}
            onSelectRecipe={handleSelectRecipe}
            onLogout={handleLogout}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onCompleteOnboarding={handleCompleteOnboarding}
            onNavigate={handleNavigate}
          />
        ) : null;
      case 'data':
        return userProfile ? <DatabasePage onNavigate={handleNavigate} /> : <LandingPage onLogin={handleLogin} />;
      case 'media':
        return userProfile ? <MediaAgentPage onNavigate={handleNavigate} /> : <LandingPage onLogin={handleLogin} />;
      case 'design':
        // Navigate to design tools - show flyer and instagram generators
        if (!userProfile) {
          return <LandingPage onLogin={handleLogin} />;
        }
        
        const designTools = ALL_TOOLS.filter(t => t.id === 'flyer-generator' || t.id === 'instagram-post-generator');
        const activeDesignTool = selectedTool && (selectedTool.id === 'flyer-generator' || selectedTool.id === 'instagram-post-generator') 
          ? selectedTool 
          : (designTools[0] || null);
        
        if (activeDesignTool) {
          return (
            <DesignAgentToolPage
              user={userProfile}
              selectedTool={activeDesignTool}
              chatHistories={chatHistories}
              onNavigate={() => handleNavigate('dashboard')}
              onUseTool={handleUseTool}
              onSetSatisfaction={handleSetSatisfaction}
            />
          );
        }
        
        // Fallback: if no design tool found, go back to dashboard
        return <Dashboard
          user={userProfile}
          toolStats={toolStats}
          onSelectTool={handleSelectTool}
          onSelectRecipe={handleSelectRecipe}
          onLogout={handleLogout}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onCompleteOnboarding={handleCompleteOnboarding}
          onNavigate={handleNavigate}
        />;
      case 'landing':
      default:
        return <LandingPage onLogin={handleLogin} />;
    }
  };
  
  const animationClass = animationState === 'in' ? 'animate-slideInRight' : 'animate-slideOutLeft';

  // Build current state for agent context
  const currentState = {
    currentPage,
    selectedTool: selectedTool?.id || null,
    selectedData: null,
    activeWorkflows: platformState.activeWorkflows,
    activeBaserowRecords: platformState.activeBaserowRecords,
  };

  return (
    <>
      <div onAnimationEnd={handleAnimationEnd} className={animationClass}>
        {renderPage()}
      </div>
      
      {/* V2: Agent Chat Widget - Always accessible */}
      {userProfile && (
        <AgentChatWidget
          userProfile={userProfile}
          currentState={currentState}
          position="bottom-right"
        />
      )}
      
      <IntakeModal
        show={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        onSubmit={handleIntakeSubmit}
      />
      {userProfile && (
        <>
            <ProfileModal
                show={showProfileModal}
                user={userProfile}
                onClose={() => setShowProfileModal(false)}
                onUpdateUser={handleUpdateUser}
            />
            <SettingsModal
                show={showSettingsModal}
                user={userProfile}
                onClose={() => setShowSettingsModal(false)}
                onUpdateUser={handleUpdateUser}
            />
        </>
      )}
    </>
  );
};

export default App;