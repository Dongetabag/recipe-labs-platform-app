// Design Agents Page
// Main page for Recipe Labs design agents (Flyers and Instagram Posts)

import React, { useState } from 'react';
import { FlyerGenerator } from './FlyerGenerator';
import { InstagramPostGenerator } from './InstagramPostGenerator';

interface DesignAgentsPageProps {
  onNavigate?: (page: string) => void;
}

export function DesignAgentsPage({ onNavigate }: DesignAgentsPageProps) {
  const [activeTab, setActiveTab] = useState<'flyer' | 'instagram'>('flyer');

  return (
    <div className="min-h-screen bg-brand-bg text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-brand-bg-tertiary border border-brand-border rounded-lg text-white hover:bg-brand-bg-secondary hover:border-brand-lemon transition-colors"
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-tech">Dashboard</span>
              </button>
            )}
          </div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">Design Agents</h1>
          <p className="text-brand-text-muted">Create Recipe Labs branded flyers and Instagram posts using AI</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-brand-border">
          <button
            onClick={() => setActiveTab('flyer')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'flyer'
                ? 'border-brand-lemon text-brand-lemon'
                : 'border-transparent text-brand-text-muted hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Flyer Generator</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'instagram'
                ? 'border-brand-lemon text-brand-lemon'
                : 'border-transparent text-brand-text-muted hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Instagram Post</span>
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'flyer' && <FlyerGenerator />}
        {activeTab === 'instagram' && <InstagramPostGenerator />}
      </div>
    </div>
  );
}


