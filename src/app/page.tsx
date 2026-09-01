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
  ExternalLink,
  Bot,
  Database,
  Search
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
          <a href="#capabilities" className="hover:text-text-primary transition-colors">Capabilities</a>
          <a href="#workflow" className="hover:text-text-primary transition-colors">How It Works</a>
          <a href="#soc" className="hover:text-text-primary transition-colors">Security Operations</a>
          <a href="#copilot" className="hover:text-text-primary transition-colors">Copilot</a>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>AI-Assisted Fraud Detection</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.15]">
            DETECT THREATS BEFORE THEY BECOME INCIDENTS.
          </h1>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            SentinelAI analyzes suspicious messages, URLs, QR codes, voice interactions, and documents to identify fraud risk and support faster security response.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/protection"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition-all shadow-medium flex items-center justify-center gap-2"
            >
              <span>Analyze a Threat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-surface-secondary border border-border/40 text-text-primary text-xs font-semibold hover:bg-surface-secondary/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore the Platform</span>
            </Link>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-text-muted border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Multi-Modal Ingestion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Risk Scoring (0–100)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>SOC Investigation Workflows</span>
            </div>
          </div>
        </div>

        {/* Live Security Threat Visualization Card */}
        <div className="w-full lg:w-[480px] shrink-0 cyber-card p-5 border border-border/40 shadow-large rounded-xl bg-surface">
          <div className="flex items-center justify-between pb-3 border-b border-border/30 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-danger" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-text-primary">THREAT ANALYSIS</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-danger/15 text-danger font-bold text-[10px] uppercase">
              CRITICAL RISK
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border/30">
              <span className="text-[9px] font-bold text-text-muted uppercase block">Risk Score</span>
              <span className="text-xl font-extrabold text-danger mt-0.5 block">94</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border/30">
              <span className="text-[9px] font-bold text-text-muted uppercase block">Classification</span>
              <span className="text-xs font-extrabold text-text-primary mt-1.5 block">PHISHING</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border/30">
              <span className="text-[9px] font-bold text-text-muted uppercase block">Confidence</span>
              <span className="text-xl font-extrabold text-success mt-0.5 block">97%</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Key Indicators</span>
              <div className="space-y-1 font-mono text-[11px] text-text-secondary">
                <div className="flex items-center gap-1.5 text-danger">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Suspicious URL domain typosquatting</span>
                </div>
                <div className="flex items-center gap-1.5 text-danger">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Credential harvesting payload detected</span>
                </div>
                <div className="flex items-center gap-1.5 text-warning">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Coercive urgency language pattern</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/30">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Recommended Action</span>
              <p className="text-xs text-text-primary font-semibold">
                Block destination domain immediately & queue incident for SOC analyst triage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAPABILITY STRIP */}
      <section id="capabilities" className="py-16 bg-surface-secondary/50 border-y border-border/30 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Multi-Modal Threat Inspection</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Supported Security Input Vectors
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: MessageSquare, label: 'Message Analysis', desc: 'SMS & chat social engineering phrase extraction.' },
              { icon: Globe, label: 'URL Analysis', desc: 'Typosquatting and credential harvesting link scan.' },
              { icon: QrCode, label: 'QR Code Analysis', desc: 'Spoofed payment VPA and account verification.' },
              { icon: Mic, label: 'Voice Analysis', desc: 'Acoustic voice clone signature detection.' },
              { icon: FileText, label: 'Document Analysis', desc: 'Forged invoice and credential OCR payload scan.' }
            ].map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div key={i} className="cyber-card p-5 border border-border/30 rounded-xl space-y-2 hover:border-primary/40 transition-all bg-surface">
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

      {/* 4. HOW IT WORKS WORKFLOW */}
      <section id="workflow" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Product Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            5-Step Threat Resolution Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Detect', desc: 'Identify suspicious signals across multi-modal inputs.' },
            { step: '02', title: 'Analyze', desc: 'Correlate structural heuristics and OCR/audio features.' },
            { step: '03', title: 'Score', desc: 'Calculate Fraud Confidence Index (0–100) using weighted rules.' },
            { step: '04', title: 'Explain', desc: 'Show evidence-backed explanations for risk classification.' },
            { step: '05', title: 'Respond', desc: 'Support SOC incident investigation and remediation.' }
          ].map((item, index) => (
            <div key={index} className="cyber-card p-5 border border-border/30 rounded-xl space-y-2 relative bg-surface">
              <span className="text-xs font-mono font-bold text-primary block">{item.step}</span>
              <h3 className="text-base font-bold text-text-primary">{item.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECURITY OPERATIONS SECTION */}
      <section id="soc" className="py-20 bg-surface-secondary/50 border-t border-border/30 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Security Operations Center</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Actionable Incident Triage & Evidence Correlation
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              SentinelAI aggregates telemetry events into actionable security tickets. Operators can inspect indicators, correlate threat vectors, and execute mitigation actions.
            </p>

            <div className="space-y-3 text-xs text-text-secondary font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Incident prioritization based on risk score</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Evidence breakdown for messages, URLs, and files</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>AI-assisted investigation timeline</span>
              </div>
            </div>

            <Link
              href="/command-center"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors shadow-small"
            >
              <span>View SOC Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-7 cyber-card p-5 border border-border/40 rounded-xl bg-surface space-y-4 shadow-large">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-xs font-extrabold uppercase text-text-primary">Incident Ticket INC-0248</span>
              <span className="px-2.5 py-0.5 rounded-full bg-danger/15 text-danger font-bold text-[10px] uppercase">Critical Severity</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-secondary border border-border/30">
                <span className="text-[9px] font-bold text-text-muted uppercase block">Classification</span>
                <span className="font-bold text-text-primary mt-0.5 block">UPI Phishing / Coercion</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-secondary border border-border/30">
                <span className="text-[9px] font-bold text-text-muted uppercase block">Risk Score</span>
                <span className="font-bold text-danger mt-0.5 block">94 / 100</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-secondary border border-border/30 text-xs space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase block">Threat Summary</span>
              <p className="text-text-secondary leading-relaxed">
                Coercive text Solicit requesting urgent bank transfer under threat of account freezing. Message contains malicious link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AI SECURITY COPILOT SECTION */}
      <section id="copilot" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Security Copilot</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            AI-Assisted Incident Investigation
          </h2>
        </div>

        <div className="cyber-card p-6 border border-border/40 rounded-xl bg-surface max-w-3xl mx-auto space-y-4 shadow-large">
          <div className="flex items-center gap-3 border-b border-border/30 pb-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase">SentinelAI Security Copilot</h3>
              <span className="text-[10px] text-text-muted">Analyzing Incident INC-0248</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-secondary border border-border/30 text-xs font-medium text-text-primary">
            &quot;Why was INC-0248 classified as critical?&quot;
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-2 leading-relaxed">
            <span className="font-bold text-primary block uppercase text-[10px]">COPILOT ASSESSMENT</span>
            <p className="text-text-secondary">
              INC-0248 was assigned a Risk Score of 94/100 due to three high-confidence risk indicators:
            </p>
            <ul className="list-disc pl-4 text-text-secondary space-y-1">
              <li><strong>Law Enforcement Coercion:</strong> Phrasing matches known digital arrest extortion patterns.</li>
              <li><strong>Credential Solicit:</strong> Request for OTP and VPA account confirmation.</li>
              <li><strong>Malicious Destination:</strong> Destination URL resolves to a newly registered phishing domain.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. ARCHITECTURE SECTION */}
      <section id="architecture" className="py-16 bg-surface-secondary/50 border-t border-border/30 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">System Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Production Architecture Specification
            </h2>
          </div>

          <div className="cyber-card p-6 border border-border/40 rounded-xl bg-surface text-left font-mono text-xs text-text-secondary space-y-4">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3 text-text-primary font-bold">
              <Terminal className="w-4 h-4 text-primary" />
              <span>SENTINELAI SYSTEM PIPELINE</span>
            </div>
            <div className="text-xs font-mono space-y-2">
              <div className="p-2.5 rounded bg-surface-secondary border border-border/30">
                Browser Client (Next.js 16 App Router)
              </div>
              <div className="text-center text-primary font-bold">↓</div>
              <div className="p-2.5 rounded bg-surface-secondary border border-border/30">
                API &amp; Extraction Services (extractor.ts / scoring.ts)
              </div>
              <div className="text-center text-primary font-bold">↓</div>
              <div className="p-2.5 rounded bg-surface-secondary border border-border/30">
                Grok (xAI) LLM Detection Node &amp; Fraud Confidence Engine
              </div>
              <div className="text-center text-primary font-bold">↓</div>
              <div className="p-2.5 rounded bg-surface-secondary border border-border/30">
                Supabase PostgreSQL Database (with Resilient Offline Fallback)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-20 px-4 sm:px-8 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          UNDERSTAND THE THREAT. RESPOND WITH CONFIDENCE.
        </h2>
        <p className="text-sm text-text-secondary max-w-xl mx-auto">
          Start analyzing suspicious digital interactions and managing security incidents with SentinelAI.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors shadow-medium"
        >
          <span>Launch SentinelAI</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* 9. FOOTER */}
      <footer className="mt-auto border-t border-border/40 py-8 px-4 sm:px-8 bg-surface text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-bold text-text-primary">SENTINELAI</span>
            <span>— AI-Assisted Fraud Detection &amp; Security Operations Platform</span>
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
