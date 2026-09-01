'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Database,
  Share2,
  CheckCircle,
  FileText,
  Activity,
  MapPin,
  TrendingUp,
  Clock,
  Radio,
  FileCode,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useAppStore, Incident } from '@/lib/store';
import { authenticatedFetch } from '@/lib/supabase';

// Mock analytics data
const threatTrendData = [
  { day: 'Mon', UPI: 42, Vishing: 24, Smishing: 65 },
  { day: 'Tue', UPI: 55, Vishing: 32, Smishing: 72 },
  { day: 'Wed', UPI: 48, Vishing: 29, Smishing: 50 },
  { day: 'Thu', UPI: 78, Vishing: 45, Smishing: 80 },
  { day: 'Fri', UPI: 90, Vishing: 52, Smishing: 95 },
  { day: 'Sat', UPI: 64, Vishing: 38, Smishing: 70 },
  { day: 'Sun', UPI: 85, Vishing: 60, Smishing: 88 }
];

export default function CommandCenterPage() {
  const {
    incidents,
    governmentIntegrations,
    resolveIncident,
    shareIncidentWithGovt,
    updateGovtStatus
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'feed' | 'integrations'>('overview');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Call dynamic analytics statistics endpoint with 5s auto-polling
  const { data: dashboardData } = useQuery({
    queryKey: ['cc-dashboard'],
    queryFn: () => authenticatedFetch('/api/command-center/dashboard').then(res => res.json()),
    refetchInterval: 5000
  });

  const { data: casesData } = useQuery({
    queryKey: ['cc-cases'],
    queryFn: () => authenticatedFetch('/api/command-center/cases').then(res => res.json()),
    refetchInterval: 5000
  });

  const ccStats = dashboardData?.stats || {
    totalCases: 0,
    criticalCases: 0,
    resolvedCases: 0,
    efficiencyRate: 92
  };

  // Default select first incident when queue opens
  useEffect(() => {
    if (incidents.length > 0 && !selectedIncident) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents]);

  const handleResolve = (id: string) => {
    resolveIncident(id);
    if (selectedIncident?.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: 'Resolved' } : null);
    }
  };

  const handleShare = (incidentId: string, agency: string) => {
    shareIncidentWithGovt(incidentId, agency);
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(prev => {
        if (!prev) return null;
        const shared = prev.sharedWith.includes(agency) ? prev.sharedWith : [...prev.sharedWith, agency];
        return { ...prev, sharedWith: shared };
      });
    }
  };

  const filteredIncidents = incidents.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-background text-on-surface flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border/30 flex items-center justify-between px-4 sm:px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent icon-glow shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-text-primary uppercase truncate">Sentinel AI Command Center</h1>
            <span className="text-[8px] sm:text-[9px] text-accent font-bold tracking-widest uppercase truncate block">
              National Security Operation Panel • Prototype Simulation
            </span>
          </div>
        </div>
 
        {/* Integration Syncing states */}
        <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-outline">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
            <span>National Cyber Cell (1930): Connected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
            <span>Reserve Bank VPA Index: Connected</span>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="flex flex-col md:flex-row flex-1 pt-16 h-full min-w-0">
        
        {/* Mobile Tab Navigation Bar */}
        <div className="flex md:hidden bg-surface border-b border-border/20 px-3 py-2 gap-1.5 overflow-x-auto hide-scrollbar shrink-0 w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors ${activeTab === 'overview' ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-secondary bg-input/40'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'queue' ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-secondary bg-input/40'}`}
          >
            <span>Incident Queue</span>
            {incidents.filter(i => i.status !== 'Resolved').length > 0 && (
              <span className="bg-danger/20 text-danger text-[8px] px-1.5 py-0.2 rounded-full">
                {incidents.filter(i => i.status !== 'Resolved').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors ${activeTab === 'feed' ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-secondary bg-input/40'}`}
          >
            Threat Feed
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors ${activeTab === 'integrations' ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-secondary bg-input/40'}`}
          >
            Govt Integrations
          </button>
        </div>

        {/* Left Nav Sidebar (Desktop) */}
        <aside className="w-64 bg-surface border-r border-border/20 hidden md:flex flex-col p-4 justify-between shrink-0">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest px-2 block">
              OPERATIONS NAVIGATION
            </span>
            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2.5 ${activeTab === 'overview' ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-outline hover:bg-surface-secondary/30 hover:text-text-primary'}`}
              >
                <Activity className="w-4 h-4" />
                <span>Overview Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('queue')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-between ${activeTab === 'queue' ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-outline hover:bg-surface-secondary/30 hover:text-text-primary'}`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Incident Queue</span>
                </div>
                {incidents.filter(i => i.status !== 'Resolved').length > 0 && (
                  <span className="bg-danger/10 border border-danger/30 text-danger text-[9px] px-2 py-0.5 rounded-full">
                    {incidents.filter(i => i.status !== 'Resolved').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('feed')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2.5 ${activeTab === 'feed' ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-outline hover:bg-surface-secondary/30 hover:text-text-primary'}`}
              >
                <Database className="w-4 h-4" />
                <span>Global Threat Feed</span>
              </button>

              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2.5 ${activeTab === 'integrations' ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-outline hover:bg-surface-secondary/30 hover:text-text-primary'}`}
              >
                <Share2 className="w-4 h-4" />
                <span>Govt Integrations</span>
              </button>
            </nav>
          </div>

          <div className="bg-surface-secondary/15 p-3.5 rounded-xl border border-border/10 space-y-1 text-center">
            <span className="text-[8px] font-bold text-outline block uppercase tracking-wider">Operator System ID</span>
            <span className="text-[10px] font-mono text-accent block font-semibold">CC-IN-882410-SH</span>
          </div>
        </aside>

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background min-w-0">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-border/10 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Active Detections</span>
                    <span className="text-2xl font-black text-text-primary">{Math.max(incidents.filter(i => i.status !== 'Resolved').length, ccStats.totalCases - ccStats.resolvedCases)} Active</span>
                  </div>
                  <div className="p-3 bg-danger/10 rounded-xl border border-danger/20 text-danger">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-border/10 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Prevented Loss Est</span>
                    <span className="text-2xl font-black text-accent">₹8.4 Cr</span>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-xl border border-accent/20 text-accent">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-border/10 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Connected Agencies</span>
                    <span className="text-2xl font-black text-text-primary">4 Connected</span>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-xl border border-accent/25 text-accent">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-border/10 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Scam Match Ratio</span>
                    <span className="text-2xl font-black text-success">{ccStats.efficiencyRate}%</span>
                  </div>
                  <div className="p-3 bg-success/10 rounded-xl border border-success/20 text-success">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Area Chart */}
                <div className="glass-card rounded-2xl p-5 border border-border/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">National Scam Trends (Weekly)</h3>
                    <span className="text-[9px] text-outline uppercase tracking-wider font-semibold">Incident Volume</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={threatTrendData}>
                        <defs>
                          <linearGradient id="colorUPI" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1b72e8" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#1b72e8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorVishing" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#01ddf7" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#01ddf7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" stroke="#8c909f" fontSize={10} />
                        <YAxis stroke="#8c909f" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#1d2022', borderColor: '#424754' }} />
                        <Area type="monotone" dataKey="UPI" stroke="#1b72e8" fillOpacity={1} fill="url(#colorUPI)" />
                        <Area type="monotone" dataKey="Vishing" stroke="#01ddf7" fillOpacity={1} fill="url(#colorVishing)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="glass-card rounded-2xl p-5 border border-border/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Scam Mitigation Types</h3>
                    <span className="text-[9px] text-outline uppercase tracking-wider font-semibold">Auto vs Manual</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={threatTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" stroke="#8c909f" fontSize={10} />
                        <YAxis stroke="#8c909f" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#1d2022', borderColor: '#424754' }} />
                        <Bar dataKey="Smishing" fill="#818cf8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Vishing" fill="#ffb4ab" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Background intelligent pipeline summary */}
              <div className="glass-card rounded-2xl p-5 border border-border/10 bg-gradient-to-r from-accent/5 to-transparent flex items-start gap-4">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Clock className="w-5 h-5 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-text-primary uppercase">Background Telemetry Pipeline Active</h4>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    Citizen applications auto-record high-risk social engineering markers. Secure evidence bundles are encrypted on-device, then matching metadata hashes are populated to this Command Center queue for tracking.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INCIDENT QUEUE */}
          {activeTab === 'queue' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch animate-[fadeIn_0.4s_ease-out]">
              
              {/* Queue List (Left 5 Columns) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Incident Tickets</span>
                  <span className="text-xs text-on-surface-variant font-semibold">{filteredIncidents.length} logs found</span>
                </div>

                {/* Search incidents */}
                <div className="relative w-full glass-card rounded-xl border border-border/10 flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    placeholder="Search query source..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none py-3.5 pl-9 pr-4 text-xs text-on-surface placeholder-outline focus:outline-none"
                  />
                </div>

                {/* Queue list container */}
                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                  {filteredIncidents.length === 0 ? (
                    <div className="glass-card rounded-xl p-4 border border-border/10 text-center text-xs text-on-surface-variant">
                      No matching queue items found.
                    </div>
                  ) : (
                    filteredIncidents.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        className={`glass-card rounded-xl p-4 border transition-all cursor-pointer ${selectedIncident?.id === inc.id ? 'border-accent bg-accent/10' : 'border-border/10 bg-surface-secondary/10 hover:border-border/20'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1 min-w-0">
                            <span className="text-[8px] font-bold text-outline uppercase tracking-wider block">
                              {inc.source} • {inc.timestamp}
                            </span>
                            <h4 className="text-xs font-bold text-text-primary truncate">{inc.title}</h4>
                          </div>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${inc.status === 'Resolved' ? 'bg-success/10 text-success border border-success/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
                            {inc.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-3 text-[10px]">
                          <span className="text-on-surface-variant truncate max-w-[200px]">{inc.evidenceSummary}</span>
                          <span className="font-bold text-accent shrink-0">{inc.confidence}% Risk</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Incident Inspector Panel (Right 7 Columns) */}
              <div className="lg:col-span-7">
                {selectedIncident ? (
                  <div className="glass-card rounded-2xl p-6 border border-border/10 space-y-6 flex flex-col justify-between h-full shadow-2xl">
                    <div className="space-y-6">
                      {/* Ticket header */}
                      <div className="flex justify-between items-start pb-4 border-b border-border/10">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-outline uppercase tracking-widest block">INCIDENT TELEMETRY DOSSIER</span>
                          <h2 className="text-base font-bold text-text-primary">{selectedIncident.title}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase">{selectedIncident.source}</span>
                            <span className="text-outline">•</span>
                            <span className="text-[10px] text-outline font-semibold">{selectedIncident.timestamp}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-gradient">{selectedIncident.confidence}%</div>
                          <span className="text-[8px] font-bold text-outline tracking-wider block uppercase mt-0.5">Confidence Ratio</span>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface-secondary/15 p-4 rounded-xl border border-border/10 space-y-1">
                          <span className="text-[8px] font-bold text-outline uppercase block tracking-wider">Origin Phone / Channel</span>
                          <span className="text-xs font-bold text-text-primary font-mono">{selectedIncident.phoneNo || 'VoIP Block'}</span>
                        </div>
                        <div className="bg-surface-secondary/15 p-4 rounded-xl border border-border/10 space-y-1">
                          <span className="text-[8px] font-bold text-outline uppercase block tracking-wider">Detected Location</span>
                          <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                            <span>{selectedIncident.location || 'Distributed IP'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Evidence Summary details */}
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-bold text-outline uppercase tracking-widest">Evidence Summary</h4>
                        <div className="bg-surface-secondary/30 p-4 rounded-xl border border-border/10 text-xs text-on-surface-variant leading-relaxed">
                          {selectedIncident.evidenceSummary}
                        </div>
                      </div>

                      {/* Telemetry packet details */}
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-bold text-outline uppercase tracking-widest">PCAP Logging Dossier (Simulated Network Capture)</h4>
                        <div className="bg-background p-4 rounded-xl border border-border/10 font-mono text-[9px] text-accent overflow-x-auto whitespace-pre-wrap max-h-36 leading-normal">
                          {`frame.time_epoch = 1718919420.2410
ip.src_host = 103.22.10.89 (Jamtara Proxy)
ip.dst_host = 172.67.20.104 (Banking node)
vishing.voice_spectrogram = [E11-VOICE-CLONE-MATCH: 0.9824]
upi.collect_request = "collect.target@okhdfc"
payload = 00 24 fc b9 a1 cd 09 d2 10 44 a8 93 1b 72 e8 01 dd f7`}
                        </div>
                      </div>

                      {/* Government sharing status */}
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-bold text-outline uppercase tracking-widest">Government sharing agencies</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedIncident.sharedWith.length === 0 ? (
                            <span className="text-xs text-on-surface-variant italic">No security agencies notified yet.</span>
                          ) : (
                            selectedIncident.sharedWith.map((agency, idx) => (
                              <span key={idx} className="bg-accent/10 border border-accent/25 text-accent text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-accent" />
                                <span>{agency}</span>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="border-t border-border/10 pt-4 flex flex-wrap gap-3 items-center justify-between">
                      {/* Agency Dispatcher triggers */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleShare(selectedIncident.id, 'National Cyber Crime')}
                          className="px-3 py-1.5 bg-surface-secondary/50 text-text-primary border border-border/20 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all"
                        >
                          Share with I4C
                        </button>
                        <button
                          onClick={() => handleShare(selectedIncident.id, 'Financial Intelligence Unit')}
                          className="px-3 py-1.5 bg-surface-secondary/50 text-text-primary border border-border/20 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all"
                        >
                          Share with Banks
                        </button>
                        <button
                          onClick={() => handleShare(selectedIncident.id, 'Cert-In Cyber')}
                          className="px-3 py-1.5 bg-surface-secondary/50 text-text-primary border border-border/20 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all"
                        >
                          Share with Cert-In
                        </button>
                      </div>

                      {/* Resolve trigger */}
                      {selectedIncident.status !== 'Resolved' ? (
                        <button
                          onClick={() => handleResolve(selectedIncident.id)}
                          className="px-4 py-2 bg-success text-text-primary font-bold text-xs uppercase rounded-lg tracking-wider transition-all flex items-center gap-1 shadow-lg shadow-success/20 active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4 text-text-primary" />
                          <span>Mark Resolved</span>
                        </button>
                      ) : (
                        <span className="text-xs text-success font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Incident Resolved</span>
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl p-6 border border-border/10 text-center text-xs text-on-surface-variant flex items-center justify-center h-64">
                    No active incident tickets selected.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THREAT FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-accent tracking-widest uppercase">
                  National Telecom Blocklist database Sync
                </span>
                <h2 className="text-base font-bold text-text-primary uppercase">Global Threat Registry</h2>
              </div>

              <div className="glass-card rounded-2xl border border-border/10 overflow-x-auto max-w-full">
                <table className="w-full text-left text-xs border-collapse min-w-[540px]">
                  <thead>
                    <tr className="bg-surface-secondary/30 border-b border-border/20 text-outline text-[10px] uppercase font-bold tracking-wider">
                      <th className="p-4">Identified Threat Address</th>
                      <th className="p-4">Source Category</th>
                      <th className="p-4">Confidence Index</th>
                      <th className="p-4">Geo Origin</th>
                      <th className="p-4">Verification status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    <tr>
                      <td className="p-4 font-mono text-text-primary">+91 95382 10928</td>
                      <td className="p-4">Voice Vishing Call</td>
                      <td className="p-4 text-danger font-bold">96%</td>
                      <td className="p-4">Jamtara, Jharkhand</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20 text-[9px] font-bold uppercase">FLAGGED</span></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-text-primary">bhim-rewards-hdfc.in</td>
                      <td className="p-4">Phishing Domain Link</td>
                      <td className="p-4 text-danger font-bold">94%</td>
                      <td className="p-4">Seychelles Hosting</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20 text-[9px] font-bold uppercase">BLOCKED</span></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-text-primary">collect.reward@upi</td>
                      <td className="p-4">UPI VPA Collect Request</td>
                      <td className="p-4 text-danger font-bold">88%</td>
                      <td className="p-4">New Delhi, India</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20 text-[9px] font-bold uppercase">FLAGGED</span></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-text-primary">Scan_Reference_98240</td>
                      <td className="p-4">Receipt Counterfeit Image</td>
                      <td className="p-4 text-amber-400 font-bold">84%</td>
                      <td className="p-4">Bengaluru, Karnataka</td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-accent/20 text-[9px] font-bold uppercase">VERIFYING</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: GOVT INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
              <div className="space-y-1">
                <span className="text-[9px] text-accent font-bold tracking-widest uppercase">
                  State agency telemetry sharing controls
                </span>
                <h2 className="text-base font-bold text-text-primary uppercase">Secure External Node Connectors</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agency Card 1 */}
                <div className="glass-card rounded-2xl p-5 border border-border/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-text-primary uppercase">National Cyber Crime Portal (I4C)</h3>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">
                        Direct connection to state blocklists. Automated upload of caller metadata triggers immediate telecom subscriber lookup.
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-success/10 border border-success/30 text-success text-[9px] font-bold uppercase tracking-wider">
                      Connected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert('Prototype Simulation: Dispatched full queue synclist.')}
                      className="px-3.5 py-2 rounded-lg bg-surface-secondary/50 border border-border/20 text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 transition-colors"
                    >
                      <span>Trigger Database Sync</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Agency Card 2 */}
                <div className="glass-card rounded-2xl p-5 border border-border/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-text-primary uppercase">Reserve Bank Payment VPA Portal</h3>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">
                        Sync link with unified national banks VPA records registry. Immediate freeze queries initiated on suspect collection VPAs.
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-success/10 border border-success/30 text-success text-[9px] font-bold uppercase tracking-wider">
                      Connected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert('Prototype Simulation: Dispatched VPA lock request list.')}
                      className="px-3.5 py-2 rounded-lg bg-surface-secondary/50 border border-border/20 text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 transition-colors"
                    >
                      <span>Submit VPA Lock requests</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Agency Card 3 */}
                <div className="glass-card rounded-2xl p-5 border border-border/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-text-primary uppercase">State Law Enforcement (STF Division)</h3>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">
                        Secure sharing of geolocational network vectors matching organized crime calls. Handles search and seize notifications.
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-accent/30 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                      Syncing
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert('Prototype Simulation: Shared geolocation matrices.')}
                      className="px-3.5 py-2 rounded-lg bg-surface-secondary/30 border border-border/20 bg-surface-secondary/50 text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 transition-colors"
                    >
                      <span>Transmit Geo Map log</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Agency Card 4 */}
                <div className="glass-card rounded-2xl p-5 border border-border/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-text-primary uppercase">CERT-In Cybersecurity Division</h3>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">
                        Automatic report sharing for server infrastructure hosting malicious APKs, fraudulent files, and screenshot templates.
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-success/10 border border-success/30 text-success text-[9px] font-bold uppercase tracking-wider">
                      Connected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert('Prototype Simulation: Dispatched APK audit registry.')}
                      className="px-3.5 py-2 rounded-lg bg-surface-secondary/30 border border-border/20 bg-surface-secondary/50 text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 transition-colors"
                    >
                      <span>Transmit apk blocklist</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
