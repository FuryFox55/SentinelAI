'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  Radio,
  Lock,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileSearch,
  MessageSquare,
  Globe,
  QrCode,
  Mic,
  FileText,
  Activity,
  Layers,
  ChevronRight,
  Terminal,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-background text-text-primary flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* 1. NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-b border-border/40 z-50 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold tracking-wider uppercase text-text-primary">
            SENTINEL<span className="text-primary">AI</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-text-secondary">
          <a href="#platform" className="hover:text-text-primary transition-colors">Platform</a>
          <a href="#capabilities" className="hover:text-text-primary transition-colors">Capabilities</a>
          <a href="#workflow" className="hover:text-text-primary transition-colors">Workflow</a>
          <a href="#architecture" className="hover:text-text-primary transition-colors">Architecture</a>
          <a href="/docs/architecture.md" target="_blank" className="hover:text-text-primary transition-colors flex items-center gap-1">
            <span>Docs</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition-all shadow-small flex items-center gap-1.5"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="space-y-6 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>AI-Assisted Fraud Detection & SOC Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            Detect and Respond to Digital Fraud Before Incidents Escalate.
          </h1>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            SentinelAI continuously analyzes suspicious messages, URLs, QR payment requests, voice streams, and document files using multi-modal AI and weighted risk scoring engines.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition-all shadow-medium flex items-center justify-center gap-2"
            >
              <span>Launch SentinelAI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#capabilities"
              className="px-6 py-3 rounded-xl bg-surface-secondary border border-border/40 text-text-primary text-xs font-semibold hover:bg-surface-secondary/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Capabilities</span>
            </a>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-text-muted border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Multi-Modal Ingestion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Weighted Fraud Scoring</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>SOC Incident Triage</span>
            </div>
          </div>
        </div>

        {/* Realistic Dashboard Graphic Preview */}
        <div className="w-full lg:w-[540px] shrink-0 cyber-card p-5 border border-border/40 shadow-large rounded-2xl relative overflow-hidden bg-surface">
          <div className="flex items-center justify-between pb-3 border-b border-border/30 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-danger" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning" />
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-[10px] font-mono text-text-muted ml-2">sentinel-soc-overview.v2</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-[9px] font-bold uppercase">System Nominal</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-surface-secondary border border-border/30">
              <span className="text-[9px] font-bold text-text-muted uppercase block">Active Incidents</span>
              <span className="text-xl font-extrabold text-text-primary mt-1 block">2 Active</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-secondary border border-border/30">
              <span className="text-[9px] font-bold text-text-muted uppercase block">Scam Detection Rate</span>
              <span className="text-xl font-extrabold text-success mt-1 block">92%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-secondary border border-border/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-danger" />
                <span>INC-0248 • CBI Digital Arrest Scam</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-danger/15 text-danger font-bold text-[9px] uppercase">Critical</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Acoustic voice cloning patterns matched coercive law enforcement extortion template. Telemetry flagged international routing translation layer.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CAPABILITY STRIP */}
      <section id="capabilities" className="py-16 bg-surface-secondary/50 border-y border-border/30 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Multi-Modal Threat Inspection</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Comprehensive Analysis Across Communication Vectors
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: MessageSquare, label: 'Chat & SMS', desc: 'Social engineering and coercive phrasing extraction' },
              { icon: Globe, label: 'Phishing URLs', desc: 'Malicious domain and typosquatting inspection' },
              { icon: QrCode, label: 'QR Payments', desc: 'UPI payee account and spoofed VPA verification' },
              { icon: Mic, label: 'Voice Audio', desc: 'Acoustic voice clone signature detection' },
              { icon: FileText, label: 'Documents', desc: 'Forged invoice and credential document OCR scan' }
            ].map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div key={i} className="cyber-card p-5 border border-border/30 rounded-xl space-y-2 hover:border-primary/40 transition-all">
                  <div className="p-2.5 w-fit rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">{cap.label}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PRODUCT WORKFLOW */}
      <section id="workflow" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">End-to-End Pipeline</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            How SentinelAI Processes Threat Telemetry
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative">
          {[
            { step: '01', title: 'Detect', desc: 'Capture raw incoming telemetry and multi-modal signals.' },
            { step: '02', title: 'Analyze', desc: 'Extract structural heuristics, OCR text, and acoustic features.' },
            { step: '03', title: 'Score', desc: 'Calculate Fraud Confidence Index (0–100) using weighted rules.' },
            { step: '04', title: 'Explain', desc: 'Generate evidence-backed explainable risk breakdowns.' },
            { step: '05', title: 'Respond', desc: 'Orchestrate SOC ticket creation and emergency contact alerts.' }
          ].map((item, index) => (
            <div key={index} className="cyber-card p-5 border border-border/30 rounded-xl space-y-2 relative">
              <span className="text-xs font-mono font-bold text-primary block">{item.step}</span>
              <h3 className="text-base font-bold text-text-primary">{item.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ARCHITECTURE SECTION */}
      <section id="architecture" className="py-16 bg-surface-secondary/50 border-t border-border/30 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">System Specification</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Technical Architecture Overview
            </h2>
          </div>

          <div className="cyber-card p-6 border border-border/40 rounded-2xl bg-surface text-left space-y-4 font-mono text-xs text-text-secondary">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3 text-text-primary font-bold">
              <Terminal className="w-4 h-4 text-primary" />
              <span>SENTINELAI DEPLOYMENT STACK</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div className="p-3 rounded-lg bg-surface-secondary border border-border/30 space-y-1">
                <span className="font-bold text-text-primary block">Client Application Layer</span>
                <span className="text-[11px] text-text-secondary block">Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand Store</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-secondary border border-border/30 space-y-1">
                <span className="font-bold text-text-primary block">AI & Detection Layer</span>
                <span className="text-[11px] text-text-secondary block">Grok (xAI) LLM Pipeline, Deterministic Fraud Confidence Engine, Extractor Services</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-secondary border border-border/30 space-y-1">
                <span className="font-bold text-text-primary block">Data & Auth Layer</span>
                <span className="text-[11px] text-text-secondary block">Supabase PostgreSQL, RLS Policies, Resilient In-Memory Mock Fallback Engine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="mt-auto border-t border-border/40 py-8 px-4 sm:px-8 bg-surface text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-bold text-text-primary">SENTINELAI</span>
            <span>— AI-Assisted Fraud Detection & SOC Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/FuryFox55/SentinelAI" target="_blank" className="hover:text-text-primary transition-colors">GitHub</a>
            <a href="/docs/architecture.md" target="_blank" className="hover:text-text-primary transition-colors">Architecture</a>
            <a href="/SECURITY.md" target="_blank" className="hover:text-text-primary transition-colors">Security</a>
            <a href="/LICENSE" target="_blank" className="hover:text-text-primary transition-colors">License</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
