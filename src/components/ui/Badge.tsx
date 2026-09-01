import React from 'react';
import { SeverityLevel } from '@/types/security';

interface BadgeProps {
  severity?: SeverityLevel | 'success' | 'warning' | 'danger' | 'info' | string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  severity = 'info',
  children,
  className = '',
  size = 'md'
}) => {
  const getBadgeStyle = () => {
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'danger') {
      return 'bg-danger/15 text-danger border-danger/30';
    }
    if (s === 'high' || s === 'warning') {
      return 'bg-warning/15 text-warning border-warning/30';
    }
    if (s === 'medium') {
      return 'bg-primary/15 text-primary border-primary/30';
    }
    if (s === 'low' || s === 'success') {
      return 'bg-success/15 text-success border-success/30';
    }
    return 'bg-surface-secondary text-text-secondary border-border/40';
  };

  const getSizeStyle = () => {
    if (size === 'sm') return 'px-2 py-0.5 text-[10px]';
    if (size === 'lg') return 'px-3.5 py-1.5 text-xs font-bold';
    return 'px-2.5 py-1 text-xs';
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-full border transition-all ${getBadgeStyle()} ${getSizeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
};
