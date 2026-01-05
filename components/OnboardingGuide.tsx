import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Tool } from '../types.ts';
import { ArrowRight, X } from './icons.tsx';
import { ALL_TOOLS } from '../constants.tsx';

interface OnboardingGuideProps {
  user: UserProfile;
  onComplete: () => void;
  targets: {
    [key: string]: React.RefObject<HTMLElement>;
  };
  onSelectTool: (tool: Tool) => void;
}

interface SpotlightStyle {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  radius?: number;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ user, onComplete, targets, onSelectTool }) => {
  const [step, setStep] = useState(0);
  const [spotlightStyle, setSpotlightStyle] = useState<SpotlightStyle>({});

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };
  
  const handleFinalStep = () => {
    onComplete();
  };

  const steps = useMemo(() => [
    { 
      targetKey: 'welcome',
      title: `Welcome, ${user.name.split(' ')[0]}!`, 
      text: 'This is your creative suite dashboard, the central hub for all your AI-powered agency tools.',
    },
    { 
      targetKey: 'quickLaunch',
      title: 'Quick Launch Bar', 
      text: 'Access any tool instantly from this sidebar. Just click an icon to jump right in.',
    },
    { 
      targetKey: 'categories',
      title: 'Find the Right Tool', 
      text: 'Our tools are organized by workflow: Strategy, Creation, Client, and Productivity. Filter them here to find what you need.',
    },
    { 
      targetKey: 'firstTool',
      title: 'Ready to Create?', 
      text: 'You\'re all set! The lab is at your command. Select any tool from the grid to start your first project.',
    }
  ], [user.name]);
  
  useEffect(() => {
    const calculateStyles = () => {
      const currentStep = steps[step];
      const targetElement = targets[currentStep.targetKey]?.current;

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const padding = 10;
        
        // Spotlight Style
        setSpotlightStyle({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          radius: 16 // rounded-2xl
        });
      } else {
        // If no target element, hide the spotlight
        setSpotlightStyle({});
      }
    };

    calculateStyles();
    window.addEventListener('resize', calculateStyles);
    return () => window.removeEventListener('resize', calculateStyles);
  }, [step, targets, steps]);

  const currentStepInfo = steps[step];

  return (
    <div className="fixed inset-0 z-[100]">
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightStyle.width && (
              <rect
                x={spotlightStyle.left}
                y={spotlightStyle.top}
                width={spotlightStyle.width}
                height={spotlightStyle.height}
                rx={spotlightStyle.radius}
                fill="black"
                className="transition-all duration-300 ease-in-out"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15,20,16,0.9)"
          mask="url(#spotlight-mask)"
          className="transition-opacity duration-300"
        />
      </svg>

      <div
        key={step}
        className="fixed top-16 left-1/2 -translate-x-1/2 bg-brand-bg-secondary border border-brand-border shadow-2xl shadow-brand-lemon/20 p-6 w-80 text-center animate-scaleIn z-[101] rounded-xl"
      >
        <h3 className="text-xl font-bold font-orbitron mb-2 gradient-text">{currentStepInfo.title}</h3>
        <p className="text-brand-text-muted mb-6">{currentStepInfo.text}</p>

        <div className="flex justify-between items-center">
          <button onClick={handleSkip} className="text-sm text-brand-text-dim hover:text-white transition-colors">Skip</button>
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-brand-lemon' : 'bg-brand-border'}`}></div>
            ))}
          </div>
          {step < steps.length - 1 ? (
             <button onClick={handleNext} className="group flex items-center gap-2 px-4 py-2 text-brand-bg font-bold rounded-md" style={{ background: 'linear-gradient(135deg, #F5D547 0%, #D4B83A 100%)' }}>
               Next <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
             </button>
          ) : (
             <button onClick={handleFinalStep} className="group flex items-center gap-2 px-4 py-2 text-white font-bold rounded-md" style={{ background: 'linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%)' }}>
               Start Creating <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
             </button>
          )}
        </div>
        <button onClick={handleSkip} className="absolute top-3 right-3 text-brand-text-dim hover:text-white">
            <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingGuide;