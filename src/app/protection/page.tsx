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
import { BottomNavigation } from '@/components/BottomNavigation';

const modulesList = [
  {
    id: 'voice',
    title: 'Voice Analysis',
    description: 'Real-time deepfake acoustic scan to identify spoofed calls.',
    icon: <Volume2 className="w-6 h-6 text-primary" />,
    status: 'Monitoring',
    statusColor: 'text-primary bg-primary/10 border-primary/20',
    lastScan: 'Just now',
    actionText: 'Inspect Voice',
    ping: true
  },
  {
    id: 'convo',
    title: 'Conversation Analysis',
    description: 'NLP scan of SMS and messaging intent matrices for fraud patterns.',
    icon: <Bot className="w-6 h-6 text-secondary" />,
    status: 'Idle',
    statusColor: 'text-text-muted bg-input border-border/30',
    lastScan: '2h ago',
    actionText: 'Analyze Chat',
    ping: false
  },
  {
    id: 'screenshot',
    title: 'Screenshot Verification',
    description: 'Validate banking transaction screen overlays for spoof details.',
    icon: <ScanLine className="w-6 h-6 text-danger" />,
    status: 'Alert',
    statusColor: 'text-danger bg-danger/10 border-danger/20',
    lastScan: '1 threat found',
    actionText: 'Review Screen',
    ping: false
  },
  {
    id: 'document',
    title: 'Document Shield',
    description: 'Deep file inspection of PDFs and invoices to prevent fake slips.',
    icon: <FileText className="w-6 h-6 text-success" />,
    status: 'Monitoring',
    statusColor: 'text-success bg-success/10 border-success/20',
    lastScan: '10m ago',
    actionText: 'Scan File',
    ping: true
  },
  {
    id: 'qr',
    title: 'QR Code Guard',
    description: 'Scan embedded UPI signatures for malicious address translation.',
    icon: <QrCode className="w-6 h-6 text-accent" />,
    status: 'Monitoring',
    statusColor: 'text-accent bg-accent/10 border-accent/20',
    lastScan: '1h ago',
    actionText: 'Verify QR',
    ping: true
  },
  {
    id: 'url',
    title: 'URL Phishing Scan',
    description: 'Verify URL registration indices and active domain blacklists.',
    icon: <Link2 className="w-6 h-6 text-warning" />,
    status: 'Monitoring',
    statusColor: 'text-warning bg-warning/10 border-warning/20',
    lastScan: 'Just now',
    actionText: 'Check URL',
    ping: true
  },
  {
    id: 'currency',
    title: 'Counterfeit Currency Check',
    description: 'Image OCR watermark verify engine for Indian banknotes.',
    icon: <Coins className="w-6 h-6 text-info" />,
    status: 'Idle',
    statusColor: 'text-text-muted bg-input border-border/30',
    lastScan: '1 day ago',
    actionText: 'Audit Banknote',
    ping: false
  },
  {
    id: 'email',
    title: 'Email Phishing Scan',
    description: 'Verify corporate header signatures and email body text for phishing redirects.',
    icon: <Mail className="w-6 h-6 text-warning" />,
    status: 'Monitoring',
    statusColor: 'text-warning bg-warning/10 border-warning/20',
    lastScan: 'Just now',
    actionText: 'Check Email',
    ping: true
  },
  {
    id: 'chat',
    title: 'Chat Group Analyzer',
    description: 'NLP scan of WhatsApp and Telegram chat logs to identify investment task frauds.',
    icon: <MessageSquare className="w-6 h-6 text-secondary" />,
    status: 'Idle',
    statusColor: 'text-text-muted bg-input border-border/30',
    lastScan: '1h ago',
    actionText: 'Scan Chat',
    ping: false
  },
  {
    id: 'threat-feed',
    title: 'Threat Intel Feed',
    description: 'Live sync index matching state cybersecurity center blacklists.',
    icon: <Cpu className="w-6 h-6 text-accent" />,
    status: 'Active',
    statusColor: 'text-accent bg-accent/10 border-accent/20',
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
        return 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(0,102,204,0.08)] dark:shadow-[0_0_18px_rgba(0,217,255,0.2)] hover:border-primary';
      case 'convo':
      case 'chat':
        return 'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 shadow-[0_0_12px_rgba(0,136,204,0.08)] dark:shadow-[0_0_18px_rgba(0,217,255,0.2)] hover:border-secondary';
      case 'screenshot':
        return 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 shadow-[0_0_12px_rgba(217,56,79,0.08)] dark:shadow-[0_0_18px_rgba(255,77,103,0.2)] hover:border-danger';
      case 'document':
        return 'bg-success/10 hover:bg-success/20 text-success border border-success/30 shadow-[0_0_12px_rgba(0,168,84,0.08)] dark:shadow-[0_0_18px_rgba(0,230,118,0.2)] hover:border-success';
      case 'qr':
      case 'threat-feed':
        return 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 shadow-[0_0_12px_rgba(0,217,255,0.08)] dark:shadow-[0_0_18px_rgba(0,217,255,0.2)] hover:border-accent';
      case 'url':
      case 'email':
        return 'bg-warning/10 hover:bg-warning/20 text-warning border border-warning/30 shadow-[0_0_12px_rgba(230,162,60,0.08)] dark:shadow-[0_0_18px_rgba(255,200,87,0.2)] hover:border-warning';
      case 'currency':
        return 'bg-info/10 hover:bg-info/20 text-info border border-info/30 shadow-[0_0_12px_rgba(0,136,204,0.08)] dark:shadow-[0_0_18px_rgba(0,217,255,0.2)] hover:border-info';
      default:
        return 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(0,102,204,0.08)] dark:shadow-[0_0_18px_rgba(0,217,255,0.2)]';
    }
  };

  const filteredModules = modulesList.filter(
    (m) =>
      m.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-background text-text-primary flex flex-col pb-24 relative">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-15">
        <div className="absolute top-[20%] left-[-20%] w-[350px] h-[350px] rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-20%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[120px]"></div>
      </div>

      {/* Top Header */}
      <header className="sticky top-0 left-0 w-full z-45 bg-surface/85 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-primary flex items-center justify-center p-1 icon-glow">
            <Shield className="w-6 h-6 fill-primary/20" />
          </Link>
          <span className="font-bold tracking-tight text-text-primary text-sm">SENTINEL AI</span>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs px-3 py-1 bg-input border border-border/30 rounded-full hover:bg-input/80 transition-all font-semibold text-text-primary"
        >
          Close
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 md:px-8 pt-6 space-y-6 relative z-10">
        
        {/* Header & Search */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">ANALYZE A THREAT</h1>
            <p className="text-xs text-text-secondary">Multi-modal threat inspection workspace. Analyze suspicious messages, URLs, QR codes, voice recordings, and documents.</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full glass-card rounded-xl overflow-hidden focus-within:border-primary border border-border/30 flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Filter security modules..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-transparent border-none py-3.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
            />
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {filteredModules.map((module) => (
            <div
              key={module.id}
              className="glass-card rounded-2xl p-5 border border-border/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col justify-between group w-full min-w-0"
            >
              <div className="space-y-4 w-full min-w-0">
                <div className="flex justify-between items-start gap-2 w-full">
                  <div className="p-2.5 rounded-xl bg-input border border-border/20 group-hover:border-primary/20 transition-all shrink-0">
                    {module.icon}
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide shrink-0 ${module.statusColor}`}>
                    {module.ping && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                    {module.status}
                  </div>
                </div>
                <div className="w-full min-w-0">
                  <h3 className="text-base font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed break-words">
                    {module.description}
                  </p>
                </div>
              </div>

              {/* Card Footer actions */}
              <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider truncate">Last Activity</span>
                  <span className="text-xs text-text-secondary font-medium truncate">{module.lastScan}</span>
                </div>
                <button
                  onClick={() => router.push(`/protection/analysis/${module.id}`)}
                  className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shrink-0 ${getGlowClass(module.id)}`}
                >
                  {module.actionText}
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Sticky Bottom Navigation Bar */}
      <BottomNavigation activeTab="threats" />
    </div>
  );
}
