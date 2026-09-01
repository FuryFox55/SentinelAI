import React from 'react';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SeverityBadge({ severity, size = 'md', className = '' }: SeverityBadgeProps) {
  const normalized = severity.toLowerCase() as SeverityLevel;

  const styles: Record<SeverityLevel, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    critical: {
      bg: 'bg-danger/10',
      text: 'text-danger',
      border: 'border-danger/30',
      icon: <ShieldAlert className="w-3 h-3 text-danger shrink-0" />
    },
    high: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning/30',
      icon: <AlertTriangle className="w-3 h-3 text-warning shrink-0" />
    },
    medium: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      border: 'border-amber-500/30',
      icon: <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
    },
    low: {
      bg: 'bg-info/10',
      text: 'text-info',
      border: 'border-info/30',
      icon: <Info className="w-3 h-3 text-info shrink-0" />
    },
    info: {
      bg: 'bg-surface-secondary',
      text: 'text-text-muted',
      border: 'border-border/40',
      icon: <Info className="w-3 h-3 text-text-muted shrink-0" />
    }
  };

  const config = styles[normalized] || styles.info;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-0.5 text-[10px]',
    lg: 'px-2.5 py-1 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
    >
      {config.icon}
      <span>{severity}</span>
    </span>
  );
}
