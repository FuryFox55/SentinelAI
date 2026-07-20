'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LogIn } from 'lucide-react';

export default function WelcomePage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-[1440px] mx-auto min-h-screen">
      {/* Background radial effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-30">
        <div className="w-[800px] h-[800px] rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-pulse duration-[6000ms]"></div>
      </div>

      {/* Hero Shield Graphic */}
      <div className="mb-8 relative w-full max-w-[360px] aspect-square flex items-center justify-center">
        <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <img
          className="w-full h-full object-contain relative z-20 drop-shadow-[0_0_40px_rgba(1,221,247,0.35)] animate-[float_6s_ease-in-out_infinite]"
          alt="Glowing 3D AI security shield"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRwh-0LBJmjUlWrqLgStCM8QuKLSFoyJZPPszZAxumsn0ef4LEcNlqP-BKQ3VUSbdee72_JTpFTP1p9t-UvZc7T8yKFVea0ymk-1587_fi_gDUOhS0cz9IH9V0m6nCYCn4_mdfedHOG55t_RGObBmcJ4hWE4YdQOpYhq524g2igQQx9q1AnyzX4iTemWnjnRSGBXGGNjauiPc034HfLPnJk9hJd7x1Ie86XvGDXOoTHZNNsRNW9z8PMBY9LahzM8-Xv_C4UuqbJ8A"
        />
      </div>

      {/* Typography & Actions */}
      <div className="text-center max-w-2xl glass-card rounded-2xl p-8 md:p-12 shadow-2xl relative z-20 border-t border-white/10 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Sentinel AI Defense
        </h1>
        <p className="text-base md:text-lg text-on-surface-variant mb-10 mx-auto max-w-md">
          Continuous AI-powered fraud protection running invisibly in the background, securing your digital life.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-full electric-flow text-white font-semibold shadow-[0_4px_20px_rgba(27,114,232,0.4)] hover:shadow-[0_4px_25px_rgba(1,221,247,0.6)] hover:scale-105 transition-all duration-300 ease-out active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-300 ease-out active:scale-95 flex items-center justify-center gap-2 text-on-surface"
          >
            <LogIn className="w-5 h-5" />
            <span>Login</span>
          </Link>
        </div>

        {/* System Status Tracker */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            System Online &amp; Secure
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </main>
  );
}
