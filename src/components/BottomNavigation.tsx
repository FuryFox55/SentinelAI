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
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 bg-navigation/95 backdrop-blur-xl border-t border-border/45 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.45)]">
      
      {/* Dashboard */}
      <button
        onClick={() => router.push('/dashboard')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
          activeTab === 'dashboard'
            ? 'text-primary'
            : 'text-text-muted hover:text-primary/70'
        }`}
      >
        {activeTab === 'dashboard' && (
          <div className="absolute top-[-8px] w-6 h-0.5 bg-primary rounded-full filter blur-[1px]"></div>
        )}
        <Grid className="w-5 h-5 transition-transform duration-200" />
        <span className="text-[9px] font-bold mt-1.5 uppercase tracking-wider">Dashboard</span>
      </button>

      {/* Threats */}
      <button
        onClick={() => router.push('/protection')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
          activeTab === 'threats'
            ? 'text-primary'
            : 'text-text-muted hover:text-primary/70'
        }`}
      >
        {activeTab === 'threats' && (
          <div className="absolute top-[-8px] w-6 h-0.5 bg-primary rounded-full filter blur-[1px]"></div>
        )}
        <Shield className="w-5 h-5 transition-transform duration-200" />
        <span className="text-[9px] font-bold mt-1.5 uppercase tracking-wider">Threats</span>
      </button>

      {/* Center Floating Mic Button */}
      <button
        onClick={handleStartSimulatedCall}
        className="flex items-center justify-center bg-card border border-primary/30 rounded-full w-14 h-14 -translate-y-4 shadow-[0_4px_16px_rgba(0,102,204,0.12)] hover:shadow-[0_4px_20px_rgba(0,102,204,0.25)] dark:shadow-[0_0_20px_rgba(0,217,255,0.25)] hover:dark:shadow-[0_0_25px_rgba(0,217,255,0.45)] active:scale-95 transition-all hover:border-primary group relative z-50"
      >
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-[6px] animate-pulse"></div>
        <Volume2 className="w-6 h-6 text-primary group-hover:scale-105 transition-transform" />
      </button>

      {/* Assistant */}
      <button
        onClick={() => router.push('/assistant')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
          activeTab === 'assistant'
            ? 'text-primary'
            : 'text-text-muted hover:text-primary/70'
        }`}
      >
        {activeTab === 'assistant' && (
          <div className="absolute top-[-8px] w-6 h-0.5 bg-primary rounded-full filter blur-[1px]"></div>
        )}
        <Bot className="w-5 h-5 transition-transform duration-200" />
        <span className="text-[9px] font-bold mt-1.5 uppercase tracking-wider">Assistant</span>
      </button>

      {/* Settings */}
      <button
        onClick={() => router.push('/profile')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
          activeTab === 'settings'
            ? 'text-primary'
            : 'text-text-muted hover:text-primary/70'
        }`}
      >
        {activeTab === 'settings' && (
          <div className="absolute top-[-8px] w-6 h-0.5 bg-primary rounded-full filter blur-[1px]"></div>
        )}
        <Settings className="w-5 h-5 transition-transform duration-200" />
        <span className="text-[9px] font-bold mt-1.5 uppercase tracking-wider">Settings</span>
      </button>
    </nav>
  );
}
