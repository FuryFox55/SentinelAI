'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Shield, Volume2, Bot, Settings } from 'lucide-react';
import { startSimulatedPhoneCall } from '@/lib/services/intelligence';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'threats' | 'assistant' | 'settings' | 'none';
}

export function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const router = useRouter();

  const handleStartSimulatedCall = () => {
    startSimulatedPhoneCall();
    router.push('/monitoring');
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-1 sm:px-4 py-1.5 bg-navigation-background/95 backdrop-blur-xl border-t border-border shadow-small">
      
      {/* Dashboard */}
      <button
        onClick={() => router.push('/dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xlarge transition-all relative flex-1 max-w-[72px] min-w-0 ${
          activeTab === 'dashboard'
            ? 'text-primary'
            : 'text-text-muted hover:text-primary'
        }`}
      >
        {activeTab === 'dashboard' && (
          <div className="absolute top-[-6px] w-6 h-0.5 bg-primary rounded-full filter blur-[1px]"></div>
        )}
        <Grid className="w-5 h-5 transition-transform duration-200 shrink-0" />
        <span className="text-[8.5px] font-bold mt-1 uppercase tracking-wider truncate w-full text-center">Dashboard</span>
      </button>

      {/* Threats */}
      <button
        onClick={() => router.push('/protection')}
        className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xlarge transition-all relative flex-1 max-w-[72px] min-w-0 ${
          activeTab === 'threats'
            ? 'text-primary'
            : 'text-text-muted hover:text-primary'
        }`}
      >
        {activeTab === 'threats' && (
          <div className="absolute top-[-6px] w-6 h-0.5 bg-primary rounded-full filter blur-[1px]"></div>
        )}
        <Shield className="w-5 h-5 transition-transform duration-200 shrink-0" />
        <span className="text-[8.5px] font-bold mt-1 uppercase tracking-wider truncate w-full text-center">Threats</span>
      </button>

      {/* Center Floating Mic Button */}
      <button
        onClick={handleStartSimulatedCall}
        className="flex items-center justify-center bg-card border border-primary/30 rounded-full w-12 h-12 sm:w-14 sm:h-14 -translate-y-3 sm:-translate-y-4 shadow-medium hover:shadow-large active:scale-95 transition-all hover:border-primary group relative z-50 shrink-0"
      >
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-[6px] animate-pulse"></div>
        <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-105 transition-transform" />
      </button>

      {/* Assistant */}
      <button
        onClick={() => router.push('/assistant')}
        className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xlarge transition-all relative flex-1 max-w-[72px] min-w-0 ${
          activeTab === 'assistant'
            ? 'text-primary'
            : 'text-text-muted hover:text-primary'
        }`}
      >
        {activeTab === 'assistant' && (
          <div className="absolute top-[-6px] w-6 h-0.5 bg-primary rounded-full filter blur-[1px]"></div>
        )}
        <Bot className="w-5 h-5 transition-transform duration-200 shrink-0" />
        <span className="text-[8.5px] font-bold mt-1 uppercase tracking-wider truncate w-full text-center">Assistant</span>
      </button>

      {/* Settings */}
      <button
        onClick={() => router.push('/profile')}
        className={`flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xlarge transition-all relative flex-1 max-w-[72px] min-w-0 ${
          activeTab === 'settings'
            ? 'text-primary'
            : 'text-text-muted hover:text-primary'
        }`}
      >
        {activeTab === 'settings' && (
          <div className="absolute top-[-6px] w-6 h-0.5 bg-primary rounded-full filter blur-[1px]"></div>
        )}
        <Settings className="w-5 h-5 transition-transform duration-200 shrink-0" />
        <span className="text-[8.5px] font-bold mt-1 uppercase tracking-wider truncate w-full text-center">Settings</span>
      </button>
    </nav>
  );
}
