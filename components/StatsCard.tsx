import React from 'react';

type StatsCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
};

export function StatsCard({
  icon,
  title,
  value,
  subtitle,
  trend = 'neutral',
  className = ''
}: StatsCardProps) {
  return (
    <div className={`glass glass-hover p-6 rounded-xl ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {trend === 'up' && <span className="text-xs text-neon-green">↑</span>}
            {trend === 'down' && <span className="text-xs text-red-500">↓</span>}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        <div className="text-4xl opacity-80 ml-4">
          {icon}
        </div>
      </div>
    </div>
  );
}
