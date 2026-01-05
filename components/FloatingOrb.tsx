
import React from 'react';

interface FloatingOrbProps {
  delay?: number;
  color?: string;
}

const FloatingOrb: React.FC<FloatingOrbProps> = ({ delay = 0, color = 'purple' }) => {
  const colors: { [key: string]: string } = {
    purple: 'from-brand-violet to-brand-royal-blue',
    blue: 'from-brand-royal-blue to-brand-sky-blue',
    green: 'from-brand-neon-green to-brand-aqua'
  };

  return (
    <div 
      className={`absolute w-64 h-64 bg-gradient-to-br ${colors[color]} rounded-full blur-3xl opacity-20 animate-float`}
      style={{ 
        animationDelay: `${delay}s`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`
      }}
    />
  );
};

export default FloatingOrb;