import React from 'react';

export type SystemStatusType = 'operational' | 'investigating' | 'resolved' | 'blocked' | 'pending' | 'failed';

interface StatusIndicatorProps {
  status: SystemStatusType | string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = true,
  className = ''
}: StatusIndicatorProps) {
  const normalized = status.toLowerCase() as SystemStatusType;

  const config: Record<SystemStatusType, { dotColor: string; textColor: string; label: string }> = {
    operational: { dotColor: 'bg-success', textColor: 'text-success', label: 'Operational' },
    investigating: { dotColor: 'bg-warning', textColor: 'text-warning', label: 'Investigating' },
    resolved: { dotColor: 'bg-info', textColor: 'text-info', label: 'Resolved' },
    blocked: { dotColor: 'bg-danger', textColor: 'text-danger', label: 'Blocked' },
    pending: { dotColor: 'bg-amber-500', textColor: 'text-amber-500', label: 'Pending' },
    failed: { dotColor: 'bg-danger', textColor: 'text-danger', label: 'Failed' }
  };

  const current = config[normalized] || {
    dotColor: 'bg-text-muted',
    textColor: 'text-text-muted',
    label: status
  };

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className={`inline-flex items-center gap-1.5 font-bold ${textSize} ${current.textColor} ${className}`}>
      <span className={`rounded-full ${dotSize} ${current.dotColor} animate-pulse shrink-0`} />
      {showLabel && <span className="uppercase tracking-wider">{current.label}</span>}
    </div>
  );
}
