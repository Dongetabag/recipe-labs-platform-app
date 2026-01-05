import React from 'react';

export interface UserProfile {
  name: string;
  email: string;
  role: 'Founder' | 'Lead Developer' | 'AI Engineer' | 'Operations';
  isPremium: boolean;
  credits: number;
  totalToolsUsed: number;
  hasCompletedOnboarding: boolean;

  // Recipe Labs Team Member fields
  department: string;
  specialization: string;
  currentProjects: string;
  primaryFocus: string;
  workStyle: string;
  toolExpertise: string;
  primaryGoals: string[];
  weeklyPriority: string;

  // UI Customization
  platformTheme: string;
  toolLayout: 'grid' | 'list';
  themeMode: 'dark' | 'light';
}

export interface Tool {
  id: string;
  name:string;
  description: string;
  category: 'Strategy' | 'Creation' | 'Client' | 'Productivity';
  // Fix: Changed from a generic React.ReactElement to one with specific props for better type safety with React.cloneElement.
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  isConversational?: boolean;
  promptExamples?: string[] | ((user: UserProfile) => string[]);
  systemInstruction?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
  satisfaction?: 'satisfied' | 'unsatisfied' | null;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  toolIds: string[];
}