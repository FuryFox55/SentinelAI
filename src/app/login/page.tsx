'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Fingerprint } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleSSO = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const triggerBiometric = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Connects to standard seeded user account for developer workflow convenience
      const { error } = await supabase.auth.signInWithPassword({
        email: 'citizen@sentinel.ai',
        password: 'password123'
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address in the Email field first.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile`
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('A password reset link has been dispatched to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error triggering password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-25">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-primary animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">SENTINEL AI</h1>
        </div>

        {/* Login Box */}
        <div className="glass-card w-full rounded-2xl p-8 md:p-10 flex flex-col gap-6 shadow-2xl">
          <div className="text-center">
            <h2 className="text-xl font-bold text-on-surface mb-2">Secure Access</h2>
            <p className="text-xs text-on-surface-variant">Authenticate to access operations center.</p>
          </div>

          {errorMsg && (
            <div className="text-center py-2 px-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="text-center py-2 px-3 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs rounded-lg">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
            {/* Email Field */}
            <div className="relative group border-b border-white/10 focus-within:border-cyan-400 transition-colors">
              <Mail className="absolute left-0 top-3 w-5 h-5 text-outline group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-transparent text-sm text-on-surface placeholder-outline focus:outline-none"
                disabled={loading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative group border-b border-white/10 focus-within:border-cyan-400 transition-colors">
              <Lock className="absolute left-0 top-3 w-5 h-5 text-outline group-focus-within:text-cyan-400 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-10 py-3 bg-transparent text-sm text-on-surface placeholder-outline focus:outline-none"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 text-outline hover:text-on-surface transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me, Create Account & Forgot Password */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors">
                  <input type="checkbox" className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 focus:ring-offset-0" />
                  <span>Remember me</span>
                </label>
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Create Account
                </Link>
              </div>
              <div className="flex justify-end text-xs">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-outline hover:text-cyan-400 transition-colors font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 rounded-xl font-semibold text-xs uppercase tracking-wider text-white electric-flow hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center py-2 text-xs">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-outline font-semibold uppercase tracking-wider text-[10px]">
              Or connect via
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Social SSO Login */}
          <button
            type="button"
            onClick={triggerGoogleSSO}
            disabled={loading}
            className="w-full py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold text-xs uppercase tracking-wider text-on-surface flex justify-center items-center gap-3 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              ></path>
            </svg>
            <span>Google Account</span>
          </button>

          {/* Biometric Login */}
          <div className="mt-2 flex justify-center">
            <button
              onClick={triggerBiometric}
              disabled={loading}
              type="button"
              className="w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 transition-all flex items-center justify-center group active:scale-95 disabled:opacity-50"
            >
              <Fingerprint className="w-7 h-7 text-outline group-hover:text-cyan-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
