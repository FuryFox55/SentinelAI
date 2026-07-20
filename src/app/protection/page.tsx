'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Search,
  Grid,
  Bot,
  Settings,
  Bell,
  Volume2,
  FileText,
  ScanLine,
  FileCode,
  QrCode,
  Link2,
  Coins,
  Cpu,
  RefreshCw,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { startSimulatedPhoneCall } from '@/lib/services/intelligence';

const modulesList = [
  {
    id: 'voice',
    title: 'Voice Analysis',
    description: 'Real-time deepfake acoustic scan to identify spoofed calls.',
    icon: <Volume2 className="w-6 h-6 text-cyan-400" />,
    status: 'Monitoring',
    statusColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    lastScan: 'Just now',
    actionText: 'Inspect Voice',
    ping: true
  },
  {
    id: 'convo',
    title: 'Conversation Analysis',
    description: 'NLP scan of SMS and messaging intent matrices for fraud patterns.',
    icon: <Bot className="w-6 h-6 text-indigo-400" />,
    status: 'Idle',
    statusColor: 'text-outline bg-white/5 border-white/10',
    lastScan: '2h ago',
    actionText: 'Analyze Chat',
    ping: false
  },
  {
    id: 'screenshot',
    title: 'Screenshot Verification',
    description: 'Validate banking transaction screen overlays for spoof details.',
    icon: <ScanLine className="w-6 h-6 text-red-400" />,
    status: 'Alert',
    statusColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    lastScan: '1 threat found',
    actionText: 'Review Screen',
    ping: false
  },
  {
    id: 'document',
    title: 'Document Shield',
    description: 'Deep file inspection of PDFs and invoices to prevent fake slips.',
    icon: <FileText className="w-6 h-6 text-emerald-400" />,
    status: 'Monitoring',
    statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    lastScan: '10m ago',
    actionText: 'Scan File',
    ping: true
  },
  {
    id: 'qr',
    title: 'QR Code Guard',
    description: 'Scan embedded UPI signatures for malicious address translation.',
    icon: <QrCode className="w-6 h-6 text-purple-400" />,
    status: 'Monitoring',
    statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    lastScan: '1h ago',
    actionText: 'Verify QR',
    ping: true
  },
  {
    id: 'url',
    title: 'URL Phishing Scan',
    description: 'Verify URL registration indices and active domain blacklists.',
    icon: <Link2 className="w-6 h-6 text-yellow-400" />,
    status: 'Monitoring',
    statusColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    lastScan: 'Just now',
    actionText: 'Check URL',
    ping: true
  },
  {
    id: 'currency',
    title: 'Counterfeit Currency Check',
    description: 'Image OCR watermark verify engine for Indian banknotes.',
    icon: <Coins className="w-6 h-6 text-amber-400" />,
    status: 'Idle',
    statusColor: 'text-outline bg-white/5 border-white/10',
    lastScan: '1 day ago',
    actionText: 'Audit Banknote',
    ping: false
  },
  {
    id: 'email',
    title: 'Email Phishing Scan',
    description: 'Verify corporate header signatures and email body text for phishing redirects.',
    icon: <Mail className="w-6 h-6 text-yellow-300" />,
    status: 'Monitoring',
    statusColor: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
    lastScan: 'Just now',
    actionText: 'Check Email',
    ping: true
  },
  {
    id: 'chat',
    title: 'Chat Group Analyzer',
    description: 'NLP scan of WhatsApp and Telegram chat logs to identify investment task frauds.',
    icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
    status: 'Idle',
    statusColor: 'text-outline bg-white/5 border-white/10',
    lastScan: '1h ago',
    actionText: 'Scan Chat',
    ping: false
  },
  {
    id: 'threat-feed',
    title: 'Threat Intel Feed',
    description: 'Live sync index matching state cybersecurity center blacklists.',
    icon: <Cpu className="w-6 h-6 text-pink-400" />,
    status: 'Active',
    statusColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    lastScan: 'Synced 1m ago',
    actionText: 'Open Feed',
    ping: true
  }
];

export default function ProtectionCenterPage() {
  const router = useRouter();
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'threats' | 'assistant' | 'settings'>('threats');

  const getGlowClass = (id: string) => {
    switch (id) {
      case 'voice':
        return 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,217,255,0.15)] hover:shadow-[0_0_18px_rgba(0,217,255,0.3)] hover:border-cyan-500/40';
      case 'convo':
        return 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)] hover:shadow-[0_0_18px_rgba(99,102,241,0.3)] hover:border-indigo-500/40';
      case 'screenshot':
        return 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(255,77,103,0.15)] hover:shadow-[0_0_18px_rgba(255,77,103,0.3)] hover:border-red-500/40';
      case 'document':
        return 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(0,230,118,0.15)] hover:shadow-[0_0_18px_rgba(0,230,118,0.3)] hover:border-emerald-500/40';
      case 'qr':
        return 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)] hover:shadow-[0_0_18px_rgba(168,85,247,0.3)] hover:border-purple-500/40';
      case 'url':
        return 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-[0_0_12px_rgba(255,200,87,0.15)] hover:shadow-[0_0_18px_rgba(255,200,87,0.3)] hover:border-yellow-500/40';
      case 'currency':
        return 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:shadow-[0_0_18px_rgba(245,158,11,0.3)] hover:border-amber-500/40';
      case 'email':
        return 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-[0_0_12px_rgba(255,200,87,0.15)] hover:shadow-[0_0_18px_rgba(255,200,87,0.3)] hover:border-yellow-500/40';
      case 'chat':
        return 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)] hover:shadow-[0_0_18px_rgba(99,102,241,0.3)] hover:border-indigo-500/40';
      case 'threat-feed':
        return 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.15)] hover:shadow-[0_0_18px_rgba(236,72,153,0.3)] hover:border-pink-500/40';
      default:
        return 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,217,255,0.15)] hover:shadow-[0_0_18px_rgba(0,217,255,0.3)]';
    }
  };

  const filteredModules = modulesList.filter(
    (m) =>
      m.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col pb-24 relative">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-15">
        <div className="absolute top-[20%] left-[-20%] w-[350px] h-[350px] rounded-full bg-cyan-500/25 blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[350px] h-[350px] rounded-full bg-indigo-500/20 blur-[120px]"></div>
      </div>

      {/* Top Header */}
      <header className="sticky top-0 left-0 w-full z-45 bg-surface/85 backdrop-blur-md border-b border-outline-variant/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-cyan-400 flex items-center justify-center p-1 icon-glow">
            <Shield className="w-6 h-6 fill-cyan-400/20" />
          </Link>
          <span className="font-bold tracking-tight text-white text-sm">SENTINEL AI</span>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all font-semibold"
        >
          Close
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-md mx-auto w-full px-4 pt-6 space-y-6 relative z-10">
        
        {/* Header & Search */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Protection Center</h1>
            <p className="text-xs text-on-surface-variant">Active defense nodes and manual diagnostic scanners.</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full glass-card rounded-xl overflow-hidden focus-within:border-cyan-400 border border-white/5 flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder="Filter security modules..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-transparent border-none py-3.5 pl-10 pr-4 text-sm text-on-surface placeholder-outline focus:outline-none"
            />
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredModules.map((module) => (
            <div
              key={module.id}
              className="glass-card rounded-2xl p-5 border border-white/5 hover:border-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/5 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5 group-hover:border-cyan-500/20 transition-all">
                    {module.icon}
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${module.statusColor}`}>
                    {module.ping && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>}
                    {module.status}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </div>

              {/* Card Footer actions */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-semibold text-outline uppercase tracking-wider">Last Activity</span>
                  <span className="text-xs text-on-surface-variant font-medium">{module.lastScan}</span>
                </div>
                <button
                  onClick={() => router.push(`/protection/analysis/${module.id}`)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${getGlowClass(module.id)}`}
                >
                  {module.actionText}
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2.5 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-2xl">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            router.push('/dashboard');
          }}
          className={`flex flex-col items-center justify-center transition-all ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-outline hover:text-on-surface'}`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[9px] font-semibold mt-1 uppercase tracking-wider">Dashboard</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('threats');
            router.push('/protection');
          }}
          className={`flex flex-col items-center justify-center transition-all ${activeTab === 'threats' ? 'text-cyan-400' : 'text-outline hover:text-on-surface'}`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[9px] font-semibold mt-1 uppercase tracking-wider">Threats</span>
        </button>

        <button
          onClick={() => {
            startSimulatedPhoneCall();
            router.push('/monitoring');
          }}
          className="flex flex-col items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full w-12 h-12 -translate-y-2 shadow-lg shadow-cyan-500/10 active:scale-90 transition-transform"
        >
          <Volume2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            setActiveTab('assistant');
            router.push('/assistant');
          }}
          className={`flex flex-col items-center justify-center transition-all ${activeTab === 'assistant' ? 'text-cyan-400' : 'text-outline hover:text-on-surface'}`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[9px] font-semibold mt-1 uppercase tracking-wider">Assistant</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('settings');
            router.push('/profile');
          }}
          className={`flex flex-col items-center justify-center transition-all ${activeTab === 'settings' ? 'text-cyan-400' : 'text-outline hover:text-on-surface'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-semibold mt-1 uppercase tracking-wider">Settings</span>
        </button>
      </nav>
    </div>
  );
}
