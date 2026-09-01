'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Smartphone, Bell, Eye, Mic, ShieldAlert, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function SetupPage() {
  const router = useRouter();
  const { toggleProtection, activeProtections } = useAppStore();
  const [granted, setGranted] = useState<Record<string, boolean>>({
    phone: false,
    notifications: true,
    accessibility: false,
    microphone: false,
  });

  const handleToggle = (key: string) => {
    setGranted(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEnableAll = () => {
    // Enable all protections in global store
    if (!activeProtections.screenshotScanner) toggleProtection('screenshotScanner');
    if (!activeProtections.backgroundAI) toggleProtection('backgroundAI');
    if (!activeProtections.liveCallMonitor) toggleProtection('liveCallMonitor');
    if (!activeProtections.urlBlocker) toggleProtection('urlBlocker');
    
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen w-full pt-24 pb-32 px-4 relative bg-background">
      {/* Background orbs */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container rounded-full blur-[150px] opacity-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-container rounded-full blur-[150px] opacity-10"></div>
      </div>

      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center px-4 sm:px-6 h-16 bg-surface/85 backdrop-blur-md border-b border-border/30 shadow-sm">
        <div className="flex items-center gap-2 max-w-[1440px] mx-auto w-full">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight text-primary">SENTINEL AI</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto flex flex-col gap-8 md:gap-12 relative z-10 w-full">
        {/* Intro */}
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
          <Shield className="w-16 h-16 text-primary mx-auto mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            System Integration
          </h1>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed">
            To provide live threat detection and immediate call alerts, Sentinel AI requires specific system access. We prioritize transparency and never process data outside your device without consent.
          </p>
        </div>

        {/* Bento permissions list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
          {/* Phone & SMS */}
          <div className="glass-panel rounded-2xl p-4 sm:p-6 hover:-translate-y-1 transition-all flex flex-col justify-between h-full border border-border/30">
            <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6">
              <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <button
                onClick={() => handleToggle('phone')}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${granted.phone ? 'bg-primary' : 'bg-border'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${granted.phone ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Phone &amp; SMS</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Required for UPI transaction monitoring and intercepting malicious SMS phishing links in real-time.
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-panel rounded-2xl p-4 sm:p-6 hover:-translate-y-1 transition-all flex flex-col justify-between h-full border border-border/30">
            <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6">
              <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 shrink-0">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${granted.notifications ? 'bg-primary' : 'bg-border'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${granted.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Push Notifications</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Enables immediate alerts for critical threats, background sync, and security block notifications.
              </p>
            </div>
          </div>

          {/* Accessibility Service */}
          <div className="glass-panel rounded-2xl p-4 sm:p-6 hover:-translate-y-1 transition-all flex flex-col justify-between h-full border border-border/30">
            <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6">
              <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 shrink-0">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <button
                onClick={() => handleToggle('accessibility')}
                className={`text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border border-border/30 transition-all shrink-0 ${granted.accessibility ? 'bg-success/20 text-success border-success/30' : 'hover:bg-input text-text-primary bg-input/40'}`}
              >
                {granted.accessibility ? 'Access Granted' : 'Grant Access'}
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Accessibility Service</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Crucial for rendering live floating call overlays on top of phone apps and blocking screen capture from malicious hosts.
              </p>
            </div>
          </div>

          {/* Microphone */}
          <div className="glass-panel rounded-2xl p-6 hover:-translate-y-1 transition-all flex flex-col justify-between h-full border border-border/30">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-danger/10 p-3 rounded-xl border border-danger/20">
                <Mic className="w-6 h-6 text-danger" />
              </div>
              <button
                onClick={() => handleToggle('microphone')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${granted.microphone ? 'bg-primary' : 'bg-border'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${granted.microphone ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Microphone</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Used locally for vishing voice analysis and detecting deepfake acoustic patterns during incoming phone conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-col items-center mt-8 gap-4 max-w-md mx-auto w-full">
          <button
            onClick={handleEnableAll}
            className="w-full py-4 rounded-xl shadow-lg electric-flow text-on-primary font-semibold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity active:scale-95 shadow-primary/20"
          >
            <Shield className="w-5 h-5 text-on-primary" />
            <span>Enable All Protections</span>
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            Skip for now (Reduced Security)
          </button>
        </div>
      </div>
    </main>
  );
}
