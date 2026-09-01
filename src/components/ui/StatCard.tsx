import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  accentColor = 'text-primary'
}) => {
  return (
    <div className="cyber-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary mt-1">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-surface-secondary border border-border/40 ${accentColor} group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-3 pt-2.5 border-t border-border/20 flex items-center justify-between text-xs">
          {subtitle && <span className="text-text-secondary">{subtitle}</span>}
          {change && (
            <span
              className={`font-semibold ${
                changeType === 'positive'
                  ? 'text-success'
                  : changeType === 'negative'
                  ? 'text-danger'
                  : 'text-text-muted'
              }`}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
