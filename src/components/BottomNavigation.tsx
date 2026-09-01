'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ShieldAlert, FileSearch, Bot, Settings, Radio } from 'lucide-react';
import { startSimulatedPhoneCall } from '@/lib/services/intelligence';

interface ApplicationShellProps {
  activeTab: 'dashboard' | 'threats' | 'incidents' | 'assistant' | 'settings' | 'none';
}

export function BottomNavigation({ activeTab }: ApplicationShellProps) {
  const router = useRouter();

  const handleStartSimulatedCall = () => {
    startSimulatedPhoneCall();
    router.push('/monitoring');
  };

  const navItems = [
    { key: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { key: 'threats', label: 'Events', icon: ShieldAlert, path: '/protection' },
    { key: 'incidents', label: 'Incidents', icon: FileSearch, path: '/command-center' },
    { key: 'assistant', label: 'Copilot', icon: Bot, path: '/assistant' },
    { key: 'settings', label: 'Settings', icon: Settings, path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 sm:px-6 py-2 bg-navigation-background/95 backdrop-blur-xl border-t border-border shadow-small">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all relative flex-1 max-w-[80px] min-w-0 ${
              isActive
                ? 'text-primary font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {isActive && (
              <div className="absolute -top-2 w-6 h-0.5 bg-primary rounded-full" />
            )}
            <Icon className="w-5 h-5 transition-transform duration-200 shrink-0" />
            <span className="text-[10px] font-medium tracking-wider truncate w-full text-center mt-1">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Floating Active Intercept Action Button */}
      <button
        onClick={handleStartSimulatedCall}
        title="Trigger Live Telephony Signal Intercept"
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 text-xs font-bold transition-all ml-2 shadow-small"
      >
        <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
        <span>LIVE INTERCEPT</span>
      </button>
    </nav>
  );
}
