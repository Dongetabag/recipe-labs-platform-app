// Database Dashboard Component
// Shows overview stats and quick actions for database

import React from 'react';

export interface DatabaseStat {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'lemon' | 'forest' | 'mint';
}

export interface DatabaseDashboardProps {
  stats: DatabaseStat[];
  title?: string;
  actions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
}

export function DatabaseDashboard({ stats, title = 'Database Overview', actions }: DatabaseDashboardProps) {
  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'forest':
        return 'bg-brand-forest/20 border-brand-forest text-brand-forest';
      case 'mint':
        return 'bg-brand-mint/20 border-brand-mint text-brand-mint';
      default:
        return 'bg-brand-lemon/20 border-brand-lemon text-brand-lemon';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white gradient-text">{title}</h2>
        {actions && actions.length > 0 && (
          <div className="flex space-x-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="px-4 py-2 bg-brand-lemon text-black rounded-lg font-medium hover:bg-brand-lemon-light transition-colors flex items-center space-x-2"
              >
                {action.icon && <span>{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg border-2 ${getColorClasses(stat.color)} transition-all hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-80">{stat.label}</span>
              {stat.icon && <div className="opacity-80">{stat.icon}</div>}
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{stat.value}</span>
              {stat.change !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    stat.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stat.change >= 0 ? '+' : ''}
                  {stat.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


