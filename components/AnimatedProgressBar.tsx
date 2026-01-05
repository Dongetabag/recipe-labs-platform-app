
import React, { useState, useEffect } from 'react';

interface AnimatedProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  height?: string;
  animated?: boolean;
  glowing?: boolean;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({ value, max, color = 'purple', showLabel = false, height = 'h-2', animated = true, glowing = false }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayPercentage(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const gradients: { [key: string]: string } = {
    purple: 'from-brand-violet to-brand-lavender',
    blue: 'from-brand-royal-blue to-brand-sky-blue',
    green: 'from-brand-neon-green to-brand-aqua',
    yellow: 'from-yellow-500 via-amber-500 to-orange-500',
    rainbow: 'from-brand-violet via-brand-royal-blue to-brand-neon-green',
    lemon: 'from-brand-lemon to-brand-forest'
  };

  const selectedGradient = gradients[color] || gradients.lemon;

  const glowShadows: { [key: string]: string } = {
    purple: 'shadow-lg shadow-brand-violet/50',
    blue: 'shadow-lg shadow-brand-royal-blue/50',
    green: 'shadow-lg shadow-brand-neon-green/50',
    yellow: 'shadow-lg shadow-yellow-500/50',
    rainbow: 'shadow-lg shadow-brand-violet/50',
    lemon: 'shadow-lg shadow-brand-lemon/50'
  };
  
  const selectedGlow = glowing ? (glowShadows[color] || glowShadows.purple) : '';


  return (
    <div className="relative">
      <div className={`${height} bg-white/10 rounded-full overflow-hidden backdrop-blur-sm`}>
        <div 
          className={`${height} bg-gradient-to-r ${selectedGradient} transition-all duration-1000 ease-out rounded-full ${animated ? 'animate-pulse' : ''} ${selectedGlow}`}
          style={{ width: `${displayPercentage}%` }}
        >
          {animated && (
            <div className="h-full w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          )}
        </div>
      </div>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {Math.round(displayPercentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default AnimatedProgressBar;