"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ShieldAlert, ShieldX, X, Play, RotateCcw } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { stopSimulatedPhoneCall } from '../lib/services/intelligence';

export const CallOverlay: React.FC = () => {
  const {
    callActive,
    callContactName,
    callNumber,
    callConfidenceIndex,
    callVoiceMode,
    callAIObservations,
    callOverlayActive,
    setOverlayActive
  } = useAppStore();

  if (!callActive || !callOverlayActive) return null;

  const isDanger = callConfidenceIndex > 75;
  const isWarning = callConfidenceIndex > 40 && callConfidenceIndex <= 75;

  const getOverlayColors = () => {
    if (isDanger) {
      return {
        bg: 'bg-red-950/85',
        border: 'border-red-500/50',
        text: 'text-red-400',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.25)]',
        badge: 'bg-red-500/20 text-red-300 border-red-500/30'
      };
    }
    if (isWarning) {
      return {
        bg: 'bg-amber-950/85',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      };
    }
    return {
      bg: 'bg-slate-950/85',
      border: 'border-cyan-500/50',
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    };
  };

  const colors = getOverlayColors();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`fixed top-4 left-4 right-4 z-[9999] md:max-w-md md:mx-auto glass-card rounded-2xl p-5 border ${colors.border} ${colors.glow} backdrop-blur-2xl`}
      >
        {/* Floating Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] tracking-widest font-bold uppercase text-outline">
              Sentinel Active Overlay
            </span>
          </div>
          <button
            onClick={() => setOverlayActive(false)}
            className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex gap-4">
          {/* Avatar / Status Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDanger ? 'bg-red-500/20' : 'bg-white/5'}`}>
            {isDanger ? (
              <ShieldX className="w-6 h-6 text-red-400 animate-pulse" />
            ) : (
              <Phone className="w-6 h-6 text-cyan-400" />
            )}
          </div>

          {/* Call Details */}
          <div className="flex-grow space-y-1 min-w-0">
            <div className="flex justify-between items-baseline gap-2">
              <h4 className="font-bold text-on-surface truncate">{callContactName}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${colors.badge}`}>
                {callVoiceMode}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">{callNumber}</p>
          </div>
        </div>

        {/* Index and Alerts */}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-on-surface-variant font-medium">Scam Confidence Score</span>
            <span className={`text-sm font-bold ${colors.text}`}>{callConfidenceIndex}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-gradient-to-r from-red-600 to-red-400' : isWarning ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`}
              style={{ width: `${callConfidenceIndex}%` }}
            ></div>
          </div>

          {/* Live Observations snippet */}
          {callAIObservations.length > 0 && (
            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                AI Agent Log
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                {callAIObservations[0]}
              </p>
            </div>
          )}
        </div>

        {/* Action Tray */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => {
              // Simulating blocking and auto report
              stopSimulatedPhoneCall();
            }}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-900/20 active:scale-95"
          >
            Block Call
          </button>
          <button
            onClick={() => {
              setOverlayActive(false);
              // Navigate to monitoring page or let user configure
            }}
            className="w-full py-3 bg-white/10 hover:bg-white/15 text-on-surface border border-white/10 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-95"
          >
            Monitor Session
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
