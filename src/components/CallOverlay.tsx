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
        bg: 'bg-badge-danger/95',
        border: 'border-danger',
        text: 'text-danger',
        glow: 'shadow-large',
        badge: 'bg-badge-danger text-danger border-danger/30'
      };
    }
    if (isWarning) {
      return {
        bg: 'bg-badge-warning/95',
        border: 'border-warning',
        text: 'text-warning',
        glow: 'shadow-large',
        badge: 'bg-badge-warning text-warning border-warning/30'
      };
    }
    return {
      bg: 'bg-background-secondary/95',
      border: 'border-primary',
      text: 'text-primary',
      glow: 'shadow-large',
      badge: 'bg-badge-info text-primary border-primary/30'
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
        className={`fixed top-4 left-4 right-4 z-[9999] max-w-[calc(100vw-2rem)] md:max-w-md md:mx-auto glass-card rounded-xlarge p-5 border ${colors.border} ${colors.glow} backdrop-blur-2xl`}
      >
        {/* Floating Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
            </span>
            <span className="text-[10px] tracking-widest font-bold uppercase text-outline">
              Sentinel Active Overlay
            </span>
          </div>
          <button
            onClick={() => setOverlayActive(false)}
            className="p-1 rounded-full hover:bg-background-secondary text-text-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex gap-4">
          {/* Avatar / Status Icon */}
          <div className={`w-12 h-12 rounded-xlarge flex items-center justify-center shrink-0 ${isDanger ? 'bg-danger/20' : 'bg-background-secondary'}`}>
            {isDanger ? (
              <ShieldX className="w-6 h-6 text-danger animate-pulse" />
            ) : (
              <Phone className="w-6 h-6 text-primary" />
            )}
          </div>

          {/* Call Details */}
          <div className="flex-grow space-y-1 min-w-0">
            <div className="flex justify-between items-baseline gap-2">
              <h4 className="font-bold text-text-primary truncate">{callContactName}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${colors.badge}`}>
                {callVoiceMode}
              </span>
            </div>
            <p className="text-xs text-text-secondary">{callNumber}</p>
          </div>
        </div>

        {/* Index and Alerts */}
        <div className="mt-4 pt-4 border-t border-divider space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary font-medium">Scam Confidence Score</span>
            <span className={`text-sm font-bold ${colors.text}`}>{callConfidenceIndex}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-background-secondary h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-primary'}`}
              style={{ width: `${callConfidenceIndex}%` }}
            ></div>
          </div>

          {/* Live Observations snippet */}
          {callAIObservations.length > 0 && (
            <div className="bg-background-secondary rounded-large p-3 border border-divider">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                AI Agent Log
              </span>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                {callAIObservations[0]}
              </p>
            </div>
          )}
        </div>

        {/* Action Tray */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => {
              stopSimulatedPhoneCall();
            }}
            className="w-full py-3 bg-danger hover:bg-danger/90 text-on-primary font-bold rounded-xlarge text-xs uppercase tracking-wider transition-colors shadow-small active:scale-95"
          >
            Block Call
          </button>
          <button
            onClick={() => {
              setOverlayActive(false);
            }}
            className="w-full py-3 bg-button-secondary hover:bg-background-secondary text-text-primary border border-border font-bold rounded-xlarge text-xs uppercase tracking-wider transition-colors active:scale-95"
          >
            Monitor Session
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
