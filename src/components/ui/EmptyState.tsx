import React from 'react';
import { ShieldCheck, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Security Events Detected',
  description = 'Telemetry matrix is actively monitoring incoming network signals and telephony events.',
  icon: Icon = ShieldCheck,
  actionLabel,
  onAction
}) => {
  return (
    <div className="cyber-card p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3">
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
        <Icon className="w-10 h-10 animate-pulse" />
      </div>
      <h3 className="text-lg font-bold text-text-primary tracking-tight">{title}</h3>
      <p className="text-xs text-text-secondary max-w-md leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-hover transition-colors shadow-md"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
