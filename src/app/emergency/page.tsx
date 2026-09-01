'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  PhoneOff,
  UserX,
  FileSpreadsheet,
  Users,
  Mic,
  MapPin,
  FileText,
  Lightbulb,
  Phone,
  Clock,
  ArrowLeft,
  Lock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function EmergencyModePage() {
  const router = useRouter();
  const {
    emergencyActive,
    lockdownEnabled,
    trustedContacts,
    emergencyReports,
    triggerEmergencyMode,
    toggleLockdown,
    resetEmergencyMode,
    addIncident
  } = useAppStore();

  const [notified, setNotified] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [reported, setReported] = useState(false);
  const [showEvidence, setShowEvidence] = useState<'none' | 'transcript' | 'location' | 'summary'>('none');

  const handleNotifyContacts = () => {
    setNotified(true);
    // Simulate SMS dispatch
    setTimeout(() => {
      setNotified(false);
      alert(`SMS Emergency Alert dispatched to trusted contacts: ${trustedContacts.join(', ')}`);
    }, 800);
  };

  const handleBlockCaller = () => {
    setBlocked(true);
    addIncident({
      title: 'Emergency Block Triggered',
      source: 'User Manual Emergency Action',
      severity: 'high',
      confidence: 100,
      evidenceSummary: 'Caller blocklisted during emergency lockdown. Voip channel logged.'
    });
    setTimeout(() => setBlocked(false), 1000);
  };

  const handleReportCrime = () => {
    setReported(true);
    addIncident({
      title: 'Cyber Crime Reporting Queue',
      source: 'Emergency National Portal Link',
      severity: 'high',
      confidence: 100,
      evidenceSummary: 'Incident report compiled and dispatched to I4C portal.'
    });
    setTimeout(() => {
      setReported(false);
      alert('Incident details compiled. Prototype Simulation: Report shared with National Cyber Crime Portal (1930).');
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-background text-on-surface flex flex-col pb-16 relative pt-20">
      
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-4 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-1 rounded-full hover:bg-surface-secondary/30 text-on-surface-variant transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <ShieldAlert className="w-6 h-6 text-danger fill-danger/20" />
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-danger">SENTINEL AI</h1>
        </div>
        <div>
          <span className="text-[10px] font-bold px-3 py-1 bg-danger/80 text-danger border border-danger/30 rounded-full uppercase tracking-wider animate-pulse">
            Emergency Mode
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-12 py-6 flex flex-col gap-6 z-10">
        
        {/* Active Threat Status Bar */}
        <section className="bg-danger/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center gap-4 sm:gap-6 border border-danger/30 shadow-[0_0_25px_rgba(239,68,68,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,rgba(255,180,171,0.5)_1px,transparent_0)] bg-[size:24px_24px]"></div>
          
          <div className="shrink-0 relative z-10 flex flex-col items-center justify-center">
            <ShieldAlert className="w-14 h-14 sm:w-20 sm:h-20 text-danger" />
            <span className="text-[9px] font-bold text-danger mt-1 sm:mt-2 uppercase tracking-widest">Active Threat</span>
          </div>

          <div className="flex-grow text-center md:text-left z-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-danger tracking-tight leading-none uppercase">Lockdown Engaged</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 text-xs">
              <span className="font-semibold text-text-primary">System Security Level: High</span>
              <span className="px-2.5 py-0.5 rounded-full bg-danger/25 border border-danger/30 font-bold text-[10px] uppercase text-danger">
                Fraud Confidence: 96%
              </span>
            </div>
            <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
              Suspicious activity detected in ongoing telephony session. Script match correlates with high-probability &quot;Digital Arrest&quot; coercion templates. Urgent shielding is active.
            </p>
          </div>
        </section>

        {/* Emergency Actions Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <button
            onClick={() => {
              resetEmergencyMode();
              router.push('/dashboard');
            }}
            className="bg-gradient-to-br from-danger to-danger/80 hover:from-danger/90 hover:to-danger/70 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 shadow-lg transition-colors h-28 sm:h-36 active:scale-95 text-center cursor-pointer"
          >
            <PhoneOff className="w-8 h-8 sm:w-10 sm:h-10 text-text-primary animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-text-primary uppercase tracking-wider">Disconnect Call</span>
          </button>

          <button
            onClick={handleBlockCaller}
            className="glass-card hover:bg-surface-secondary/30 border-danger/20 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 transition-all h-28 sm:h-36 active:scale-95 text-center text-danger cursor-pointer"
          >
            <UserX className="w-8 h-8 sm:w-10 sm:h-10 text-danger shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{blocked ? 'Blocking...' : 'Block Caller'}</span>
          </button>

          <button
            onClick={handleReportCrime}
            className="glass-card hover:bg-surface-secondary/30 border border-border/10 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 transition-all h-28 sm:h-36 active:scale-95 text-center text-accent cursor-pointer"
          >
            <FileSpreadsheet className="w-8 h-8 sm:w-10 sm:h-10 text-accent shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{reported ? 'Reporting...' : 'Report Scam'}</span>
          </button>

          <button
            onClick={handleNotifyContacts}
            className="glass-card hover:bg-surface-secondary/30 border border-border/10 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 transition-all h-28 sm:h-36 active:scale-95 text-center text-indigo-400 cursor-pointer"
          >
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{notified ? 'Notifying...' : 'Notify Contacts'}</span>
          </button>
        </section>

        {/* Content Area: Evidence package & timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Evidence & Guidance */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Evidence Package */}
            <section className="glass-card rounded-[24px] p-6 border border-border/10 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-border/10 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Evidence Locker</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-success/10 text-success border border-success/25 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Secured locally</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Voice Transcript file */}
                <div
                  onClick={() => setShowEvidence(showEvidence === 'transcript' ? 'none' : 'transcript')}
                  className={`glass-card rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-accent/50 transition-colors cursor-pointer border ${showEvidence === 'transcript' ? 'border-accent bg-accent/15' : 'border-white/5 bg-surface-secondary/10'}`}
                >
                  <Mic className="w-8 h-8 text-accent" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Call Transcript</h4>
                    <span className="text-[9px] text-outline font-semibold uppercase tracking-wider block mt-0.5">Spectral Audit</span>
                  </div>
                </div>

                {/* Geolocation file */}
                <div
                  onClick={() => setShowEvidence(showEvidence === 'location' ? 'none' : 'location')}
                  className={`glass-card rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-accent/50 transition-colors cursor-pointer border ${showEvidence === 'location' ? 'border-accent bg-accent/15' : 'border-white/5 bg-surface-secondary/10'}`}
                >
                  <MapPin className="w-8 h-8 text-indigo-400" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Location Index</h4>
                    <span className="text-[9px] text-outline font-semibold uppercase tracking-wider block mt-0.5">Cellular Tower</span>
                  </div>
                </div>

                {/* Summary file */}
                <div
                  onClick={() => setShowEvidence(showEvidence === 'summary' ? 'none' : 'summary')}
                  className={`glass-card rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-accent/50 transition-colors cursor-pointer border ${showEvidence === 'summary' ? 'border-accent bg-accent/15' : 'border-white/5 bg-surface-secondary/10'}`}
                >
                  <FileText className="w-8 h-8 text-success" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Scam Summary</h4>
                    <span className="text-[9px] text-outline font-semibold uppercase tracking-wider block mt-0.5">AI Compiled</span>
                  </div>
                </div>
              </div>

              {/* Evidence details drawer preview */}
              {showEvidence !== 'none' && (
                <div className="bg-surface-secondary/30 p-4 rounded-xl border border-border/10 mt-4 space-y-2 animate-[fadeIn_0.3s_ease-out]">
                  <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Evidence File View</span>
                  {showEvidence === 'transcript' && (
                    <div className="text-xs space-y-2 text-on-surface-variant font-mono max-h-40 overflow-y-auto pr-1">
                      <p className="text-danger">[01:15] Caller: &quot;You are under digital arrest. Transfer 45,000 to the verification ledger immediately.&quot;</p>
                      <p className="text-accent">[01:45] AI Agent: (Alert) Intent pattern matched known banking extortions.</p>
                      <p className="text-danger">[02:03] Caller: &quot;Confirm your debit transaction PIN to verify.&quot;</p>
                    </div>
                  )}
                  {showEvidence === 'location' && (
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      VoIP origin packet network maps routing indices matching servers located outside legal borders. Cell tower signature spoofing registered on gateway ports 8089 and 9443.
                    </p>
                  )}
                  {showEvidence === 'summary' && (
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Scam Type: Vishing (Voice Phishing). Impersonated official entity: Central CBI Cyber Division. Intent: Financial extraction via coerce-fear tactics. Verification code harvesting flagged.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Emergency Guidance */}
            <section className="glass-card rounded-[24px] p-6 border border-border/10 border-l-4 border-l-accent shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Emergency Guidance</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface-secondary/15 border border-border/10 rounded-xl p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center shrink-0 text-xs font-bold text-accent">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Remain Calm</h4>
                    <p className="text-[10px] text-on-surface-variant mt-1">Sentinel AI has successfully isolated your bank app keys and SMS cache.</p>
                  </div>
                </div>

                <div className="bg-surface-secondary/15 border border-danger/10 rounded-xl p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-danger/10 border border-danger/25 flex items-center justify-center shrink-0 text-xs font-bold text-danger">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-danger">Do not share PIN</h4>
                    <p className="text-[10px] text-on-surface-variant mt-1">Under no circumstances type or read passwords or OTP tokens to the caller.</p>
                  </div>
                </div>

                <div className="bg-surface-secondary/15 border border-border/10 rounded-xl p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center shrink-0 text-xs font-bold text-accent">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Report Number</h4>
                    <p className="text-[10px] text-on-surface-variant mt-1">Flag details to state authorities to compile local telecom blocks.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-1">
            <section className="glass-card rounded-[24px] p-6 border border-border/10 shadow-xl flex flex-col gap-4 h-full">
              <div className="flex items-center gap-2 border-b border-border/10 pb-3">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Incident Log Timeline</h3>
              </div>

              <div className="relative pl-4 mt-2 flex-grow">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-border/10 ml-[-0.5px]"></div>
                <div className="flex flex-col gap-6">
                  
                  <div className="relative pl-6 py-1">
                    <div className="absolute left-[-21px] top-3.5 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-[9px] text-danger font-semibold block mb-1">02:03 PM</span>
                    <h4 className="text-xs font-bold text-text-primary">Call Threat Intercept</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Vishing signatures detected in incoming voice stream.</p>
                  </div>

                  <div className="relative pl-6 py-1">
                    <div className="absolute left-[-21px] top-3.5 w-2.5 h-2.5 rounded-full bg-accent"></div>
                    <span className="text-[9px] text-accent font-semibold block mb-1">02:04 PM</span>
                    <h4 className="text-xs font-bold text-text-primary">Emergency Lockdown Active</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">System access logs locked. Security banner popped up.</p>
                  </div>

                  <div className="relative pl-6 py-1">
                    <div className="absolute left-[-21px] top-3.5 w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
                    <span className="text-[9px] text-indigo-400 font-semibold block mb-1">02:05 PM</span>
                    <h4 className="text-xs font-bold text-text-primary">Evidence Packet Locked</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Audio transcription compiled and indexed locally.</p>
                  </div>

                  <div className="relative pl-6 py-1">
                    <div className="absolute left-[-21px] top-3.5 w-2.5 h-2.5 rounded-full bg-surface-secondary/30 border border-border/20 animate-pulse"></div>
                    <span className="text-[9px] text-outline font-semibold block mb-1">Current</span>
                    <h4 className="text-xs font-semibold text-on-surface-variant italic">Awaiting User Decision</h4>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>

      </main>
    </div>
  );
}
