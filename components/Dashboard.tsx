

import React, { useState, useMemo, useRef } from 'react';
import { UserProfile, Tool, Recipe } from '../types.ts';
import { ALL_TOOLS, ALL_RECIPES } from '../constants.tsx';
import {
  User, LogOut, Settings, Search, Grid, Layers, Compass, Sparkles, Users, Briefcase, Star
} from './icons.tsx';
import OnboardingGuide from './OnboardingGuide.tsx';

interface DashboardProps {
  user: UserProfile;
  toolStats: { [key: string]: { usage: number } };
  onSelectTool: (tool: Tool) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onCompleteOnboarding: () => void;
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  toolStats,
  onSelectTool,
  onSelectRecipe,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  onCompleteOnboarding,
  onNavigate,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'All' | 'Strategy' | 'Creation' | 'Client' | 'Productivity'>('All');

    const onboardingRefs = {
        welcome: useRef<HTMLDivElement>(null),
        quickLaunch: useRef<HTMLDivElement>(null),
        categories: useRef<HTMLDivElement>(null),
        firstTool: useRef<HTMLDivElement>(null),
    };

    const filteredTools = useMemo(() => {
        return ALL_TOOLS.filter(tool => {
            const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
            const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || tool.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory]);

    const categories: ('Strategy' | 'Creation' | 'Client' | 'Productivity')[] = ['Strategy', 'Creation', 'Client', 'Productivity'];

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Strategy': return <Compass className="w-5 h-5" />;
            case 'Creation': return <Sparkles className="w-5 h-5" />;
            case 'Client': return <Users className="w-5 h-5" />;
            case 'Productivity': return <Briefcase className="w-5 h-5" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    return (
    <>
      {!user.hasCompletedOnboarding && (
        <OnboardingGuide
          user={user}
          onComplete={onCompleteOnboarding}
          targets={onboardingRefs}
          onSelectTool={onSelectTool}
        />
      )}
      <div className="min-h-screen bg-brand-bg text-white relative overflow-hidden flex">
        {/* Tech Grid Background */}
        <div className="absolute inset-0 tech-grid-bg opacity-20 pointer-events-none" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-lemon/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-forest/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

        {/* Sidebar */}
        <aside ref={onboardingRefs.quickLaunch} className="w-20 bg-brand-bg-secondary/80 backdrop-blur-md border-r border-brand-border flex flex-col items-center py-6 space-y-4 z-20">
            {/* Logo Mark */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg font-orbitron glow-lemon-sm"
              style={{ background: 'linear-gradient(135deg, #F5D547 0%, #D4B83A 50%, #4A7C4E 100%)' }}
            >
              R
            </div>
            <div className="flex-grow space-y-2 pt-4">
                {ALL_TOOLS.slice(0, 8).map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => onSelectTool(tool)}
                      className="group relative p-3 bg-brand-bg-tertiary/50 hover:bg-brand-bg-tertiary rounded-lg transition-all hover:glow-lemon-sm border border-transparent hover:border-brand-lemon/30"
                      title={tool.name}
                    >
                        <div className="p-1 bg-gradient-to-br from-brand-lemon to-brand-forest rounded-md text-white">
                          {React.cloneElement(tool.icon, { className: 'w-5 h-5' })}
                        </div>
                    </button>
                ))}
            </div>
        </aside>

        <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="bg-brand-bg-secondary/80 backdrop-blur-md border-b border-brand-border px-4 sm:px-8 py-4 flex items-center justify-between z-20">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-dim" />
                    <input
                        type="text"
                        placeholder="Search for a tool..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-brand-bg-tertiary border border-brand-border py-2.5 pl-12 pr-4 text-white placeholder-brand-text-dim focus:ring-2 focus:ring-brand-lemon/50 focus:border-brand-lemon/50 transition-all rounded-lg font-tech"
                    />
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    {onNavigate && (
                      <>
                        <button 
                          onClick={() => onNavigate('design')} 
                          className="px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white hover:bg-brand-lemon/20 hover:text-brand-lemon transition-colors font-tech text-sm"
                          title="Design Agents"
                        >
                          Design
                        </button>
                        <button 
                          onClick={() => onNavigate('data')} 
                          className="px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white hover:bg-brand-lemon/20 hover:text-brand-lemon transition-colors font-tech text-sm"
                          title="Database Management"
                        >
                          Database
                        </button>
                        <button 
                          onClick={() => onNavigate('media')} 
                          className="px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white hover:bg-brand-lemon/20 hover:text-brand-lemon transition-colors font-tech text-sm"
                          title="Media Agent"
                        >
                          Media Engine
                        </button>
                      </>
                    )}
                    <div className="text-right hidden sm:block">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-brand-text-muted font-tech">{user.role}</p>
                    </div>
                    <button onClick={onOpenProfile} className="p-2.5 bg-brand-bg-tertiary rounded-full hover:bg-brand-lemon/20 hover:text-brand-lemon transition-colors border border-brand-border" title="Profile">
                        <User className="w-5 h-5" />
                    </button>
                    <button onClick={onOpenSettings} className="p-2.5 bg-brand-bg-tertiary rounded-full hover:bg-brand-lemon/20 hover:text-brand-lemon transition-colors border border-brand-border" title="Settings">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button onClick={onLogout} className="p-2.5 bg-brand-bg-tertiary rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors border border-brand-border" title="Log Out">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
                {/* Welcome Section */}
                <div ref={onboardingRefs.welcome} className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold font-orbitron">
                      Welcome to the Lab, <span className="gradient-text">{user.name.split(' ')[0]}</span>
                    </h1>
                    <p className="text-brand-text-muted font-tech">Your AI-powered creative suite is ready.</p>
                </div>

                {/* Recipes Section */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-orbitron">
                      <Layers className="text-brand-lemon" /> Recipes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ALL_RECIPES.map(recipe => (
                             <div
                               key={recipe.id}
                               onClick={() => onSelectRecipe(recipe)}
                               role="button"
                               tabIndex={0}
                               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectRecipe(recipe); }}
                               className="group relative bg-brand-bg-secondary border border-brand-border rounded-2xl p-6 transition-all hover:border-brand-lemon/50 hover:glow-lemon-sm hover:-translate-y-1 cursor-pointer"
                             >
                                 <div className="absolute -inset-px bg-gradient-to-br from-brand-lemon/20 to-brand-forest/20 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-2xl" />
                                 <div className="relative">
                                     <div className="flex justify-between items-start">
                                         <div className="flex-1 pr-4">
                                            <h3 className="text-lg font-bold text-white">{recipe.name}</h3>
                                            <p className="text-sm text-brand-text-muted mt-1">{recipe.description}</p>
                                         </div>
                                         <div
                                           className="p-3 rounded-lg text-white"
                                           style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}
                                         >
                                            {React.cloneElement(recipe.icon, { className: "w-6 h-6" })}
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2 mt-4">
                                         {recipe.toolIds.slice(0, 4).map(toolId => {
                                             const tool = ALL_TOOLS.find(t => t.id === toolId);
                                             return tool ? (
                                               <div
                                                 key={tool.id}
                                                 className="p-1 bg-gradient-to-br from-brand-lemon-dark to-brand-forest rounded-md text-white"
                                                 title={tool.name}
                                               >
                                                 {React.cloneElement(tool.icon, { className: 'w-4 h-4' })}
                                               </div>
                                             ) : null;
                                         })}
                                     </div>
                                     <div onClick={(e) => e.stopPropagation()} className="mt-6">
                                        <button
                                          onClick={() => onSelectRecipe(recipe)}
                                          className="w-full text-brand-bg font-bold py-2.5 rounded-lg transition-all hover:opacity-90"
                                          style={{ background: 'linear-gradient(135deg, #F5D547 0%, #D4B83A 100%)' }}
                                        >
                                            Run Recipe
                                        </button>
                                     </div>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>

                {/* AI Tools Section */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-orbitron">
                      <Grid className="text-brand-lemon" /> AI Tools
                    </h2>
                    <div ref={onboardingRefs.categories} className="flex flex-wrap gap-2 mb-6">
                        <button
                          onClick={() => setSelectedCategory('All')}
                          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all font-tech ${selectedCategory === 'All' ? 'bg-brand-lemon text-brand-bg' : 'bg-brand-bg-tertiary text-brand-text-muted hover:bg-brand-border border border-brand-border'}`}
                        >
                          All
                        </button>
                        {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all font-tech ${selectedCategory === cat ? 'bg-brand-lemon text-brand-bg' : 'bg-brand-bg-tertiary text-brand-text-muted hover:bg-brand-border border border-brand-border'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {filteredTools.length > 0 ? (
                        <div ref={onboardingRefs.firstTool} className={`grid gap-6 ${user.toolLayout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {filteredTools.map(tool => (
                                <div
                                  key={tool.id}
                                  onClick={() => onSelectTool(tool)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectTool(tool); }}
                                  className="group relative bg-brand-bg-secondary border border-brand-border rounded-2xl p-6 cursor-pointer transition-all hover:border-brand-lemon/50 hover:glow-lemon-sm hover:-translate-y-1"
                                >
                                    <div className="absolute -inset-px bg-gradient-to-br from-brand-lemon/10 to-brand-forest/10 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-2xl" />
                                    <div className="relative flex flex-col h-full">
                                        <div className="flex items-start gap-4">
                                            <div
                                              className="p-3 rounded-lg text-white"
                                              style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}
                                            >
                                                {tool.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                                                <p className="text-sm text-brand-text-muted mt-1">{tool.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex-grow" />
                                        <div className="flex justify-between items-center mt-4">
                                             <div className="flex items-center gap-2 text-xs font-tech text-brand-text-dim">
                                                {getCategoryIcon(tool.category)}
                                                <span>{tool.category}</span>
                                            </div>
                                            <div className="text-xs font-tech text-brand-text-dim">
                                                {toolStats[tool.id]?.usage || 0} uses
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-brand-border rounded-2xl">
                             <p className="text-brand-text-muted">No tools found for "{searchTerm}".</p>
                             <button onClick={() => setSearchTerm('')} className="mt-4 text-sm font-semibold text-brand-lemon hover:underline">Clear search</button>
                        </div>
                    )}
                </div>
            </main>
        </div>

        {/* Brand Spectrum Bar */}
        <div className="brand-spectrum" />
      </div>
    </>
  );
};

export default Dashboard;
