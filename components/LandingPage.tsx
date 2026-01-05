
import React from 'react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-brand-bg text-white flex items-center justify-center relative overflow-hidden">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 tech-grid-bg opacity-30" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-brand-bg/80" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-lemon/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-brand-forest/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="text-center relative z-10 p-4 animate-fadeIn">
        {/* Logo Mark */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden glow-lemon"
            style={{ background: 'linear-gradient(135deg, #F5D547 0%, #D4B83A 50%, #4A7C4E 100%)' }}
          >
            <span className="text-4xl font-bold text-white font-orbitron relative z-10">R</span>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-wider font-orbitron flex items-center justify-center gap-2 mb-2">
          <span className="gradient-text">RCPE</span>
          <span className="text-brand-text-muted text-lg font-tech tracking-widest">LAB</span>
        </h1>

        {/* Tagline */}
        <p className="text-sm font-tech text-brand-text-muted tracking-widest uppercase mb-6">
          Made By Recipe
        </p>

        <p className="text-lg md:text-xl text-brand-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
          An AI-powered creative suite for agencies. Ideate, create, and deliver — faster.
        </p>

        {/* CTA Button */}
        <button
          onClick={onLogin}
          className="group relative inline-flex items-center justify-center"
        >
          <div
            className="absolute -inset-1 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-md"
            style={{ background: 'linear-gradient(135deg, #F5D547 0%, #D4B83A 50%, #4A7C4E 100%)' }}
          />
          <div className="relative bg-brand-bg px-10 py-4 rounded-full border border-brand-border-light group-hover:border-brand-lemon/50 transition-all duration-300">
            <span className="font-orbitron tracking-widest text-white group-hover:text-brand-lemon transition-colors">
              ENTER THE LAB
            </span>
          </div>
        </button>

        {/* Footer tagline */}
        <p className="mt-16 text-xs text-brand-text-dim font-tech tracking-widest">
          ENTERPRISE SOLUTIONS FOR EVERY AGENCY
        </p>
      </div>

      {/* Brand Spectrum Bar */}
      <div className="brand-spectrum" />
    </div>
  );
};

export default LandingPage;
