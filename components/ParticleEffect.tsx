
import React, { useMemo } from 'react';

const ParticleEffect: React.FC = () => {
  const particles = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
