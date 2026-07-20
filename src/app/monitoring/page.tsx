'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PhoneOff,
  ShieldAlert,
  Shield,
  AlertTriangle,
  User,
  History,
  HelpCircle,
  Activity,
  Mic,
  MessageSquareCode,
  Radio,
  Lock
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { startSimulatedPhoneCall, stopSimulatedPhoneCall } from '@/lib/services/intelligence';
import { AudioWaveform } from '@/components/AudioWaveform';

export default function CallMonitoringPage() {
  const router = useRouter();
  const {
    callActive,
    callContactName,
    callNumber,
    callDuration,
    callConfidenceIndex,
    callAIObservations,
    callTimeline,
    callVoiceMode,
    triggerEmergencyMode,
    addIncident
  } = useAppStore();

  useEffect(() => {
    // Start simulation on mount
    startSimulatedPhoneCall();
    return () => {
      stopSimulatedPhoneCall();
    };
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isDanger = callConfidenceIndex > 75;
  const isWarning = callConfidenceIndex > 40 && callConfidenceIndex <= 75;

  const handleDisconnect = () => {
    stopSimulatedPhoneCall();
    router.push('/dashboard');
  };

  const handleBlockCaller = () => {
    addIncident({
      title: `Blocked Fraud Number: ${callNumber}`,
      source: 'User Manual Block',
      severity: 'high',
      confidence: 100,
      phoneNo: callNumber,
      evidenceSummary: `User blocked caller during active monitoring due to scam index of ${callConfidenceIndex}%.`
    });
    handleDisconnect();
  };

  const handleTriggerEmergency = () => {
    triggerEmergencyMode(`Automatic emergency trigger during suspicious call from ${callContactName} (${callNumber}). Fraud Index: ${callConfidenceIndex}%`);
    router.push('/emergency');
  };

  // Keyword highlighting utility
  const highlightKeywords = (text: string) => {
    const keywords = [
      /cbi/gi,
      /digital arrest/gi,
      /verify/gi,
      /pin/gi,
      /otp/gi,
      /money/gi,
      /collect/gi,
      /police/gi,
      /arrest/gi,
      /account/gi,
      /transfer/gi
    ];
    let highlighted = text;
    keywords.forEach((regex) => {
      highlighted = highlighted.replace(regex, (match) => {
        return `<span class="text-red-400 font-extrabold bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20">${match}</span>`;
      });
    });
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative pb-16 pt-20 overflow-x-hidden">
      
      {/* Top Banner Alert (Critical State) */}
      {isDanger && (
        <div className="w-full bg-red-950/90 text-red-200 border-b border-red-500/35 py-3 px-4 flex items-center justify-center gap-2 sticky top-0 z-50 animate-pulse">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-center">
            CRITICAL SCAM SIGNATURE DETECTED. DISCONNECT CHANNEL IMMEDIATELY.
          </span>
        </div>
      )}

      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-cyan-400 fill-cyan-400/10" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Live Call Intelligence</span>
        </div>
        <span className="text-[8px] font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 animate-pulse">
          SIMULATION ACTIVE
        </span>
      </header>

      {/* Main Grid Wrapper */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-12 py-6 flex flex-col gap-6 z-10">
        
        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT 8 COLUMNS: Active Call Visuals, Transcript, Observations */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Live Session Display Panel */}
            <div className={`glass-card rounded-[24px] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden border ${isDanger ? 'border-red-500/20 shadow-[0_0_30px_rgba(255,77,103,0.1)]' : 'border-white/5 shadow-2xl'}`}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Call identity bar */}
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-white leading-tight">{callContactName}</h3>
                    <span className="text-xs text-on-surface-variant mt-0.5">{callNumber}</span>
                  </div>
                </div>

                <div className="flex flex-col md:items-end">
                  <span className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums">
                    {formatDuration(callDuration)}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="text-[8px] font-bold text-cyan-300 uppercase tracking-widest">
                      On-Device AI Parser Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Audio Waveform Section */}
              <div className="mt-4 bg-white/[0.01] border border-white/5 rounded-2xl py-6 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[8px] font-extrabold text-outline uppercase tracking-widest">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Telephony Stream telemetry</span>
                </div>

                {/* Pulser overlay */}
                <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 transition-all duration-300 ${isDanger ? 'bg-red-500/10 border-red-500/40 animate-pulse' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
                  <Mic className={`w-6 h-6 ${isDanger ? 'text-red-400' : 'text-cyan-400'}`} />
                </div>

                <AudioWaveform isActive={callActive} intensity={isDanger ? 'high' : isWarning ? 'medium' : 'low'} />
              </div>

              {/* Real-Time Live Script Transcription with keyword highlighting */}
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-[9px] font-bold text-outline uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquareCode className="w-4 h-4 text-cyan-400" />
                    <span>Live Call Script Transcript</span>
                  </h4>
                  <span className="text-[8.5px] font-semibold text-red-400 uppercase">Suspicious keywords highlighted</span>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-4.5 border border-white/5 max-h-48 overflow-y-auto space-y-3.5 hide-scrollbar">
                  {callAIObservations.length === 0 ? (
                    <span className="text-xs text-on-surface-variant italic">Awaiting speech signatures...</span>
                  ) : (
                    callAIObservations.map((obs, idx) => (
                      <div key={idx} className="flex gap-3 text-xs leading-relaxed items-start">
                        {/* Suspect vs User indicators */}
                        <span className="text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 bg-red-950/20 text-red-400 border border-red-500/20">
                          🔴 Suspect
                        </span>
                        <p className="text-on-surface-variant">
                          {highlightKeywords(obs)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Diagnostics and mitigation variables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Timeline list */}
              <div className="glass-card rounded-[24px] p-6 border border-white/5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <History className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Analysis Log Timeline</h3>
                </div>
                
                <div className="relative pl-4 border-l border-white/10 flex flex-col gap-5 mt-2">
                  {callTimeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border ${item.risk ? 'bg-red-500 border-red-400 shadow-[0_0_8px_rgba(255,77,103,0.5)]' : 'bg-surface border-cyan-400'}`}></div>
                      <span className="text-[8px] text-outline font-extrabold tracking-wider block mb-0.5">{item.time}</span>
                      <p className={`text-xs ${item.risk ? 'text-red-400 font-semibold' : 'text-on-surface-variant'}`}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainable AI metrics panel */}
              <div className="glass-card rounded-[24px] p-6 border border-white/5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Explainable AI Diagnostics</h3>
                </div>

                <div className="space-y-3.5">
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0 text-cyan-300 font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Accent Verification</h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Caller accent matches regional scam call centers.</p>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0 text-cyan-300 font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Telephony Routing Map</h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Virtual VOIP number generated via overseas proxy layers.</p>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0 text-cyan-300 font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Key Phrase Matching</h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Scam script triggered on match of payment instructions.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT 4 COLUMNS: Dial Metrics & Mitigation control */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Risk Index Dial Meter */}
            <div className="glass-card rounded-[24px] p-6 flex flex-col items-center justify-center text-center gap-6 border border-white/5 shadow-2xl relative">
              <div className="w-full flex justify-between items-center text-xs">
                <span className="font-semibold text-outline uppercase tracking-wider text-[9px]">Calculated Threat</span>
                <span className="font-bold text-white">98% Accuracy</span>
              </div>

              {/* Gauge SVG */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
                  <circle
                    className="transition-all duration-1000 ease-out"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="42"
                    stroke={isDanger ? '#FF4D67' : isWarning ? '#FFC857' : '#00D9FF'}
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - callConfidenceIndex / 100)}`}
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
                
                <div className="flex flex-col items-center z-10">
                  <span className={`text-4xl font-black tracking-tighter ${isDanger ? 'text-red-400' : 'text-cyan-400'}`}>
                    {callConfidenceIndex}%
                  </span>
                  <span className={`text-[8.5px] font-extrabold uppercase tracking-widest mt-1 ${isDanger ? 'text-red-400' : 'text-cyan-300'}`}>
                    {callVoiceMode}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Verdict</span>
                <p className={`text-xs font-bold uppercase tracking-widest ${isDanger ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                  {isDanger ? '🚨 HIGH VISHING DANGER' : 'SECURE LINE'}
                </p>
              </div>
            </div>

            {/* Mitigation Control Keys */}
            <div className="glass-card rounded-[24px] p-6 flex flex-col gap-4 border border-white/5 shadow-2xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mitigation Controls</h3>
              
              <button
                onClick={handleDisconnect}
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg active-press flex items-center justify-center gap-2"
              >
                <PhoneOff className="w-4 h-4 text-white" />
                <span>Disconnect Call</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleBlockCaller}
                  className="cyber-card py-3.5 flex flex-col items-center gap-2 transition-all active:scale-95 text-red-400 hover:border-red-500/30"
                >
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Block Number</span>
                </button>
                
                <button
                  onClick={handleDisconnect}
                  className="cyber-card py-3.5 flex flex-col items-center gap-2 transition-all active:scale-95 text-cyan-400 hover:border-cyan-500/30"
                >
                  <HelpCircle className="w-5 h-5 text-cyan-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Report Scam</span>
                </button>
              </div>

              <button
                onClick={handleTriggerEmergency}
                className="w-full py-3.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 text-red-400 font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>Trigger emergency mode</span>
              </button>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
