"use client";

import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface FraudConfidenceEngineProps {
  fraudIndex: number;
  aiConfidence: number;
  threatLevel: 'Secure' | 'Warning' | 'Critical';
  evidence: string[];
  recommendations: string[];
  explanation: string;
}

export const FraudConfidenceEngine: React.FC<FraudConfidenceEngineProps> = ({
  fraudIndex,
  aiConfidence,
  threatLevel,
  evidence,
  recommendations,
  explanation
}) => {
  const getColors = () => {
    switch (threatLevel) {
      case 'Critical':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          progress: 'bg-red-500',
          icon: <ShieldAlert className="w-8 h-8 text-red-400" />
        };
      case 'Warning':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          progress: 'bg-amber-500',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />
        };
      default:
        return {
          border: 'border-cyan-500/30',
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          progress: 'bg-cyan-500',
          icon: <ShieldCheck className="w-8 h-8 text-cyan-400" />
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`glass-card rounded-2xl p-6 ${colors.border} ambient-shadow space-y-6`}>
      {/* Engine Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {colors.icon}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-outline uppercase">FRAUD CONFIDENCE ENGINE</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xl font-bold ${colors.text}`}>{threatLevel}</span>
              <span className="text-xs text-on-surface-variant font-medium">Risk Level</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gradient">{fraudIndex}%</div>
          <div className="text-[10px] text-outline tracking-wider font-semibold uppercase">FRAUD INDEX</div>
        </div>
      </div>

      {/* Main Stats Dials */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low/50 rounded-xl p-4 border border-white/5">
          <span className="text-[10px] font-semibold text-outline uppercase tracking-wider block mb-2">Confidence Index</span>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${colors.progress}`} style={{ width: `${fraudIndex}%` }}></div>
          </div>
          <span className="text-xs text-on-surface mt-2 inline-block font-semibold">{fraudIndex}% Risk Ratio</span>
        </div>

        <div className="bg-surface-container-low/50 rounded-xl p-4 border border-white/5">
          <span className="text-[10px] font-semibold text-outline uppercase tracking-wider block mb-2">AI Scan Accuracy</span>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-cyan-400 transition-all duration-500" style={{ width: `${aiConfidence}%` }}></div>
          </div>
          <span className="text-xs text-on-surface mt-2 inline-block font-semibold">{aiConfidence}% Confidence</span>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <h5 className="text-xs font-semibold text-outline tracking-wider uppercase mb-2">EXPLAINABLE AI OBSERVATION</h5>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {explanation}
        </p>
      </div>

      {/* Evidence & Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Evidence */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-outline tracking-wider uppercase">THREAT ANALYSIS EVIDENCE</h5>
          <ul className="space-y-2">
            {evidence.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="text-cyan-400 mt-1 select-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-outline tracking-wider uppercase">RECOMMENDED MITIGATION</h5>
          <ul className="space-y-2">
            {recommendations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-on-surface-variant">
                <span className="text-emerald-400 mt-1 select-none">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
