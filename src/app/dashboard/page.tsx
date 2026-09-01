'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  AlertOctagon,
  Search,
  Settings,
  Bell,
  Activity,
  Bot,
  Grid,
  Fingerprint,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle,
  HelpCircle,
  Clock,
  Check,
  Radio,
  FileCheck,
  Cpu,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { authenticatedFetch } from '@/lib/supabase';
import { startSimulatedPhoneCall } from '@/lib/services/intelligence';
import { BottomNavigation } from '@/components/BottomNavigation';

// Cycling banner messages
const bannerMessages = [
  "Scanning incoming voice streams...",
  "AI analyzing behavioral patterns...",
  "Monitoring SMS and conversations...",
  "Screenshot verification complete.",
  "No threats detected.",
  "Protection services operational."
];

// Helper for count-up animation
function useCountUp(target: number, duration: number = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    if (end === 0) return;
    const incrementTime = Math.max(Math.floor(duration / end), 8);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function DashboardPage() {
  const router = useRouter();
  const {
    protectionScore,
    fraudConfidenceIndex,
    threatLevel,
    activeProtections,
    alerts,
    toggleProtection,
    resolveAlert,
    recalculateScore,
    user
  } = useAppStore();

  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [bannerIndex, setBannerIndex] = useState(0);

  // Live queries from backend with 5s auto-polling
  const { data: dbData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => authenticatedFetch('/api/dashboard').then(res => res.json()),
    refetchInterval: 5000
  });

  const { data: historyData } = useQuery({
    queryKey: ['history'],
    queryFn: () => authenticatedFetch('/api/history').then(res => res.json()),
    refetchInterval: 5000
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => authenticatedFetch('/api/notifications').then(res => res.json()),
    refetchInterval: 5000
  });

  const unreadNotificationsCount = notificationsData?.notifications?.filter((n: any) => !n.is_read).length || 0;

  // Real-time Toast Notifications state
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; message: string }>>([]);
  const [seenNotificationIds, setSeenNotificationIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!notificationsData?.notifications) return;
    
    const newToasts: any[] = [];
    const newSeen = new Set(seenNotificationIds);
    let updated = false;
    
    notificationsData.notifications.forEach((notif: any) => {
      if (!newSeen.has(notif.id)) {
        newSeen.add(notif.id);
        updated = true;
        
        // Only trigger toast for notifications generated after load
        if (seenNotificationIds.size > 0 && notif.type === 'emergency') {
          newToasts.push({
            id: notif.id,
            title: notif.title,
            message: notif.message
          });
        }
      }
    });

    if (updated) {
      setSeenNotificationIds(newSeen);
      if (newToasts.length > 0) {
        setToasts((prev) => [...prev, ...newToasts]);
        newToasts.forEach((t) => {
          setTimeout(() => {
            setToasts((prev) => prev.filter((item) => item.id !== t.id));
          }, 6000);
        });
      }
    }
  }, [notificationsData?.notifications]);

  const apiSummary = dbData?.summary || {
    protectionScore: 92,
    preventedCount: 124,
    callsTodayCount: 5,
    threatLevel: 'Secure'
  };

  // Count-up hook stats
  const animatedScore = useCountUp(apiSummary.protectionScore);
  const animatedPrevented = useCountUp(apiSummary.preventedCount);
  const animatedCalls = useCountUp(apiSummary.callsTodayCount);

  useEffect(() => {
    recalculateScore();
    
    // Cycle AI banner messages
    const bannerTimer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerMessages.length);
    }, 4000);

    return () => {
      clearInterval(bannerTimer);
    };
  }, []);

  const handleStartSimulatedCall = () => {
    startSimulatedPhoneCall();
    router.push('/monitoring');
  };

  // Trigger simulated phone call if active call generated on the backend
  useEffect(() => {
    if (apiSummary.liveCall?.active && !useAppStore.getState().callActive) {
      handleStartSimulatedCall();
      authenticatedFetch('/api/dashboard/call', { method: 'POST' }).catch(() => {});
    }
  }, [apiSummary.liveCall?.active]);

  const handleRunFullScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const isCritical = threatLevel === 'Critical';
  const isWarning = threatLevel === 'Warning';

  // Stagger variants for entry animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen w-full bg-background text-text-primary flex flex-col pb-28 relative overflow-x-hidden">
      
      {/* Background Radial Glows & Grid Particle Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div className="absolute top-[8%] left-[-15%] w-[420px] h-[420px] rounded-full bg-primary/10 blur-[130px] pulse-ring"></div>
        <div className="absolute bottom-[25%] right-[-15%] w-[380px] h-[380px] rounded-full bg-primary/5 blur-[120px]"></div>
      </div>

      {/* Top Header */}
      <header className="sticky top-0 left-0 w-full z-45 bg-surface/85 backdrop-blur-xl border-b border-border/40 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-primary flex items-center justify-center p-1.5 rounded-xl bg-primary/5 border border-primary/20 icon-glow">
            <Shield className="w-5 h-5 fill-primary/10" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-text-primary text-xs leading-none">SENTINEL AI</span>
            <span className="text-[7.5px] font-extrabold text-primary uppercase tracking-widest mt-1">
              Federal Protection Suite
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-xl hover:bg-input border border-transparent hover:border-border/30 text-text-secondary hover:text-text-primary transition-all relative active:scale-95">
            <Bell className="w-4.5 h-4.5" />
            {(unreadNotificationsCount > 0 || alerts.filter(a => a.status === 'unresolved').length > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border border-background animate-pulse"></span>
            )}
          </Link>
          <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-xs tracking-tight shadow-md">
            {user?.avatar || 'SR'}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 pt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10 auto-rows-min"
      >
        
        {/* 1. MEMORABLE HERO CARD */}
        <motion.section
          variants={itemVariants}
          className={`col-span-full glass-card rounded-[24px] p-5 sm:p-6 border relative overflow-hidden flex flex-col justify-between gap-5 shadow-[0_16px_36px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)] transition-all duration-300 ${
            isCritical ? 'border-danger/45 glow-danger pulse-danger-card' : 'border-border/30'
          }`}
        >
          {/* Subtle blueprint grid overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_2px_2px,var(--primary)_1.5px,transparent_0)] bg-[size:16px_16px]"></div>
          {/* Scanline light sweep */}
          <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/20 to-transparent scan-line-anim pointer-events-none"></div>

          <div className="flex justify-between items-start z-10">
            <div className="space-y-1">
              <span className="text-[8.5px] font-bold text-text-secondary uppercase tracking-wider block">Security Core Status</span>
              <h2 className="text-base sm:text-lg font-black text-text-primary tracking-tight leading-tight">
                {isCritical ? 'CRITICAL INCIDENT' : 'SYSTEM FULLY SECURED'}
              </h2>
            </div>
            
            {/* Pulsing Status Chip */}
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
              isCritical 
                ? 'bg-danger/10 border border-danger/30 text-danger shadow-[0_0_10px_rgba(255,77,103,0.1)]' 
                : 'bg-success/10 border border-success/30 text-success shadow-[0_0_10px_rgba(0,230,118,0.1)]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-danger animate-ping' : 'bg-success animate-pulse'}`}></span>
              <span>{isCritical ? 'Critical' : 'Protected'}</span>
            </span>
          </div>

          {/* Radial Meter and Stats split */}
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6 py-2 border-y border-border/20 z-10">
            
            {/* Circular Shield Gauge */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="42" stroke="var(--divider)" strokeWidth="6" />
                <circle
                  className="transition-all duration-1000 ease-out"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="42"
                  stroke={isCritical ? 'var(--danger)' : 'var(--primary)'}
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - animatedScore / 100)}`}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-lg sm:text-xl font-black text-text-primary leading-none">{animatedScore}%</span>
                <span className="text-[7px] text-text-secondary font-extrabold uppercase tracking-widest mt-1">G-Index</span>
              </div>
            </div>

            {/* Statistics grid */}
            <div className="flex-1 grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-3 w-full">
              <div className="space-y-0.5">
                <span className="text-[8px] font-extrabold text-text-secondary uppercase tracking-widest block">Scams Prevented</span>
                <span className="text-sm font-black text-text-primary tracking-tight">{animatedPrevented}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-extrabold text-text-secondary uppercase tracking-widest block">Calls Today</span>
                <span className="text-sm font-black text-text-primary tracking-tight">{animatedCalls}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-extrabold text-text-secondary uppercase tracking-widest block">AI Confidence</span>
                <span className="text-sm font-black text-success tracking-tight">98% Match</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-extrabold text-text-secondary uppercase tracking-widest block">System Health</span>
                <span className="text-sm font-black text-primary tracking-tight">Nominal</span>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
            <div className="flex items-center gap-2 text-[10px] text-text-secondary font-medium">
              <Activity className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />
              <span>Background AI heuristics active</span>
            </div>

            {/* Deep Scan CTA button */}
            {scanning ? (
              <div className="w-36 space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-bold text-primary uppercase tracking-widest">
                  <span>Scanning...</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-input h-1 rounded-full overflow-hidden border border-border/30">
                  <div className="h-full bg-primary transition-all duration-100" style={{ width: `${scanProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRunFullScan}
                className="px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_15px_rgba(0,102,204,0.03)] hover:shadow-[0_0_20px_rgba(0,102,204,0.15)] hover:border-primary flex items-center gap-1.5 group shrink-0"
              >
                <span>Deep Scan</span>
                <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </motion.section>

        {/* 2. AI STATUS BANNER WITH LIVE FEED */}
        <motion.div
          variants={itemVariants}
          className="col-span-full w-full bg-card border border-border/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary animate-pulse" />
            </div>
            <span className="text-[9.5px] text-text-secondary font-extrabold uppercase tracking-widest shrink-0 hidden sm:inline">SENTINEL FEED:</span>
            <div className="h-4 relative overflow-hidden flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.span
                  key={bannerIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-[10px] text-text-primary font-bold block absolute truncate w-full"
                >
                  {bannerMessages[bannerIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></span>
            <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">Sync Now</span>
          </div>
        </motion.div>

        {/* 3. CALL MONITORING (Visual Flagship Centerpiece) */}
        <motion.section variants={itemVariants} className="col-span-full md:col-span-1 space-y-3">
          <span className="text-[9.5px] font-extrabold text-text-secondary uppercase tracking-widest block px-1">
            Active Telephony Core
          </span>
          <motion.button
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartSimulatedCall}
            className="w-full text-left p-5 rounded-[24px] bg-card border border-primary/30 hover:border-primary hover:shadow-[0_0_24px_rgba(0,102,204,0.06)] dark:hover:shadow-[0_0_24px_rgba(0,217,255,0.1)] transition-all group relative overflow-hidden flex flex-col justify-between"
          >
            {/* Animated SVG Audio Waveform background */}
            <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none w-32 h-16 flex items-end gap-1.5">
              <div className="w-1 h-8 bg-primary rounded-full wave-bar" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-14 bg-primary rounded-full wave-bar" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-1 h-6 bg-primary rounded-full wave-bar" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-16 bg-primary rounded-full wave-bar" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-1 h-10 bg-primary rounded-full wave-bar" style={{ animationDelay: '0.4s' }}></div>
            </div>

            <div className="flex justify-between items-center w-full z-10">
              {/* Icon Container with glowing glass styling */}
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(0,102,204,0.08)] dark:shadow-[0_0_12px_rgba(0,217,255,0.15)] group-hover:scale-105 transition-transform">
                <Volume2 className="w-5.5 h-5.5 text-primary" />
              </div>

              {/* Status & Threat Chips */}
              <div className="flex gap-2">
                <span className="text-[8px] font-extrabold uppercase bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-danger animate-ping"></span>
                  <span>LIVE</span>
                </span>
                <span className="text-[8px] font-extrabold uppercase bg-input text-text-secondary border border-border/30 px-2 py-0.5 rounded-full">
                  Low Risk
                </span>
              </div>
            </div>

            <div className="space-y-1 mt-4 z-10">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider group-hover:text-primary transition-colors">
                Live Phishing Inspector
              </h4>
              <p className="text-[11px] text-text-secondary leading-relaxed max-w-[280px]">
                Active voice monitoring scans telephony streams for digital clone signatures.
              </p>
              <span className="text-[8.5px] text-primary font-extrabold uppercase tracking-widest block pt-0.5">
                Intercept Audio Stream →
              </span>
            </div>
          </motion.button>
        </motion.section>

        {/* 4. OTHER SCANNERS (Secondary Modules Grid) */}
        <motion.section variants={itemVariants} className="col-span-full md:col-span-1 grid grid-cols-2 gap-4">
          
          {/* Convo Card */}
          <Link href="/protection/analysis/convo" className="block">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="cyber-card p-4 h-36 flex flex-col justify-between relative group overflow-hidden border border-indigo-500/20"
            >
              <div className="absolute right-0 bottom-0 opacity-5 w-12 h-12 bg-indigo-500 rounded-tl-full pointer-events-none"></div>
              
              <div className="flex justify-between items-start w-full">
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <span className="text-[8px] font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                  ONLINE
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-text-primary group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors uppercase">Convo Scanner</h4>
                <p className="text-[9px] text-text-secondary leading-snug line-clamp-2">SMS intent and message patterns.</p>
                <span className="text-[8px] text-indigo-500 dark:text-indigo-400 font-bold uppercase block">Open Scanner →</span>
              </div>
            </motion.div>
          </Link>

          {/* Protection Card */}
          <Link href="/protection" className="block">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="cyber-card p-4 h-36 flex flex-col justify-between relative group overflow-hidden border border-success/20"
            >
              <div className="absolute right-0 bottom-0 opacity-5 w-12 h-12 bg-success rounded-tl-full pointer-events-none"></div>

              <div className="flex justify-between items-start w-full">
                <div className="w-9 h-9 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <span className="text-[8px] font-bold uppercase bg-success/10 text-success px-1.5 py-0.5 rounded">
                  READY
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-text-primary group-hover:text-success transition-colors uppercase">Protection Center</h4>
                <p className="text-[9px] text-text-secondary leading-snug line-clamp-2">Inspect document and QR slips.</p>
                <span className="text-[8px] text-success font-bold uppercase block">Inspect →</span>
              </div>
            </motion.div>
          </Link>

        </motion.section>

        {/* 5. RECENT ACTIVITY TIMELINE (Security Operations Center Feed) */}
        <motion.section variants={itemVariants} className="col-span-full md:col-span-1 xl:col-span-2 space-y-3.5">
          <span className="text-[9.5px] font-extrabold text-text-secondary uppercase tracking-widest block px-1">
            Recent Telemetry Activity (SOC Feed)
          </span>

          <div className="glass-card rounded-[24px] p-5 border border-border/30 shadow-lg space-y-4">
            
            {/* Timeline wrapper */}
            <div className="relative pl-5 border-l border-border/30 flex flex-col gap-4">
              {historyData?.history && historyData.history.length > 0 ? (
                (historyData.history as any[]).slice(0, 3).map((item: any) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[24.5px] top-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,102,204,0.3)]"></div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary">
                      <span>{item.analyzer_type.toUpperCase()} Scan - {item.classification}</span>
                      <span>{new Date(item.processed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-text-primary mt-0.5">{item.raw_payload?.summary || 'Standard scanner inspect completed.'}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute -left-[24.5px] top-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,102,204,0.3)]"></div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary">
                      <span>Voice Monitoring Started</span>
                      <span>11:45 AM</span>
                    </div>
                    <p className="text-[10px] text-text-primary mt-0.5">Telephony scanner bound to SMS audio receiver index.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[24.5px] top-1 w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(0,230,118,0.3)]"></div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary">
                      <span>Screenshot Verified</span>
                      <span>11:46 AM</span>
                    </div>
                    <p className="text-[10px] text-text-primary mt-0.5">No alterations detected on the uploaded HDFC transaction slip.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[24.5px] top-1 w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(0,230,118,0.3)]"></div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary">
                      <span>Scam Probability: Low</span>
                      <span>11:47 AM</span>
                    </div>
                    <p className="text-[10px] text-text-primary mt-0.5">Continuous silent audit score recalibrated to 98% secure.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* 6. REFINED SYSTEM PERMISSION LAYERS */}
        <motion.section variants={itemVariants} className="col-span-full md:col-span-1 glass-card rounded-[24px] p-5 border border-border/30 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/20">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-primary" />
              <span>Guard Shield Layers</span>
            </h3>
            <span className="text-[9px] font-bold text-primary uppercase flex items-center gap-1">
              <span className="w-1 h-1 bg-success rounded-full animate-ping"></span>
              <span>Active</span>
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Protection Layer 1 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-text-primary block">Continuous Silent Audit</span>
                <div className="flex items-center gap-1.5 text-[9px] text-text-secondary">
                  <span className="text-success font-bold uppercase">🟢 Operational</span>
                  <span>•</span>
                  <span>Verified Just now</span>
                </div>
              </div>
              <button
                onClick={() => toggleProtection('backgroundAI')}
                className={`relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors active-press ${activeProtections.backgroundAI ? 'bg-primary shadow-[0_0_10px_rgba(0,102,204,0.25)]' : 'bg-input border border-border/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${activeProtections.backgroundAI ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Protection Layer 2 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-text-primary block">Telemetry Voice Intercept</span>
                <div className="flex items-center gap-1.5 text-[9px] text-text-secondary">
                  <span className="text-success font-bold uppercase">🟢 Operational</span>
                  <span>•</span>
                  <span>Verified 2m ago</span>
                </div>
              </div>
              <button
                onClick={() => toggleProtection('liveCallMonitor')}
                className={`relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors active-press ${activeProtections.liveCallMonitor ? 'bg-primary shadow-[0_0_10px_rgba(0,102,204,0.25)]' : 'bg-input border border-border/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${activeProtections.liveCallMonitor ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Protection Layer 3 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-text-primary block">SMS URL Redirect Blocker</span>
                <div className="flex items-center gap-1.5 text-[9px] text-text-secondary">
                  <span className="text-success font-bold uppercase">🟢 Operational</span>
                  <span>•</span>
                  <span>Verified 10m ago</span>
                </div>
              </div>
              <button
                onClick={() => toggleProtection('urlBlocker')}
                className={`relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors active-press ${activeProtections.urlBlocker ? 'bg-primary shadow-[0_0_10px_rgba(0,102,204,0.25)]' : 'bg-input border border-border/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${activeProtections.urlBlocker ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </motion.section>

      </motion.main>

      {/* STICKY BOTTOM NAVIGATION BAR */}
      <BottomNavigation activeTab="dashboard" />

      {/* Dynamic Slide-in Threat Alert Toasts */}
      <div className="fixed bottom-24 right-4 left-4 md:left-auto md:max-w-xs z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-danger/95 border border-danger/40 rounded-2xl p-4 shadow-[0_8px_32px_rgba(239,68,68,0.25)] backdrop-blur-md flex items-start gap-3 text-left relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-danger animate-[loading_6s_linear_forwards]"></div>
              <ShieldAlert className="w-5 h-5 text-danger shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">{t.title}</h4>
                <p className="text-[10px] text-danger/90 leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="absolute top-3 right-3 text-danger hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
