'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: mobile,
            role: 'Citizen'
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data?.session) {
        router.push('/dashboard');
      } else {
        setSuccessMsg('Registration successful! Please check your email for verification.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 relative bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-25">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 shadow-sm">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-2">Create Account</h1>
          <p className="text-xs text-on-surface-variant">Join SENTINEL AI and safeguard yourself</p>
        </div>

        {/* Form Box */}
        <div className="glass-panel ambient-shadow rounded-2xl p-6 md:p-8">
          {errorMsg && (
            <div className="mb-4 text-center py-2 px-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 text-center py-2 px-3 bg-green-950/40 border border-green-500/20 text-green-400 text-xs rounded-lg">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="fullName" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative border-b border-white/10 focus-within:border-cyan-400 transition-colors">
                <User className="absolute left-0 top-3 w-5 h-5 text-outline transition-colors" />
                <input
                  type="text"
                  id="fullName"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-transparent text-sm text-on-surface placeholder-outline focus:outline-none"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative border-b border-white/10 focus-within:border-cyan-400 transition-colors">
                <Mail className="absolute left-0 top-3 w-5 h-5 text-outline transition-colors" />
                <input
                  type="email"
                  id="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-transparent text-sm text-on-surface placeholder-outline focus:outline-none"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-1">
              <label htmlFor="mobile" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="relative border-b border-white/10 focus-within:border-cyan-400 transition-colors">
                <Phone className="absolute left-0 top-3 w-5 h-5 text-outline transition-colors" />
                <input
                  type="tel"
                  id="mobile"
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-transparent text-sm text-on-surface placeholder-outline focus:outline-none"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Password
              </label>
              <div className="relative border-b border-white/10 focus-within:border-cyan-400 transition-colors">
                <Lock className="absolute left-0 top-3 w-5 h-5 text-outline transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
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
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative border-b border-white/10 focus-within:border-cyan-400 transition-colors">
                <Lock className="absolute left-0 top-3 w-5 h-5 text-outline transition-colors" />
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-transparent text-sm text-on-surface placeholder-outline focus:outline-none"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 rounded-xl font-semibold text-xs uppercase tracking-wider text-white electric-flow hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6 text-sm text-on-surface-variant">
          <span>Already have an account? </span>
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Login here
          </Link>
        </div>
      </div>
    </main>
  );
}
