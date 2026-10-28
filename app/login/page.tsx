'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Automatically append domain if user only entered the username handle
    const cleanUsername = username.trim().toLowerCase();
    const fullEmail = cleanUsername.includes('@') 
      ? cleanUsername 
      : `${cleanUsername}@ctpl.gov.pk`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: fullEmail,
        password,
      });

      if (authError) throw authError;

      const user = authData.user;

      // Fetch user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, jurisdiction')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile record not found. Please contact admin.');
      }

      // Role-Based Routing Matrix
      if (['super_admin', 'section1_admin', 'section2_admin'].includes(profile.role)) {
        router.push('/'); // Master HQ Dashboard with Full Global Rights
      } else if (profile.role === 'circle_reader') {
        router.push('/circle-dashboard'); // Circle Reader Oversight Portal
      } else if (profile.role === 'division_reader') {
        router.push('/division-dashboard'); // Division Reader Oversight Portal (upcoming)
      } else if (profile.role === 'zone_reader') {
        router.push('/zone-dashboard'); // Zone Reader Oversight Portal (upcoming)
      } else {
        router.push('/sector-dashboard'); // Sector/Field Officer Dashboard
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans px-4 py-10">
      
      {/* Top Brand / Header */}
      <div className="max-w-md w-full mx-auto text-center space-y-3 pt-6">
        <div className="inline-flex h-20 w-20 rounded-3xl bg-slate-900 items-center justify-center shadow-xl shadow-cyan-500/20 border border-cyan-400/30 overflow-hidden p-2 mx-auto">
          <img 
            src="/ctpl-logo.png" 
            alt="CTPL Lahore Logo" 
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          CTPL Diary Management System
        </h1>
        <p className="text-xs text-cyan-400 font-medium">
          Secure Authentication Portal - Reader Branch CTO Office, Lahore
        </p>
      </div>

      {/* Login Box */}
      <div className="max-w-md w-full mx-auto bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8 my-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Authorized Personnel Login</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your ID to access secure operations</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official ID / Username</label>
            <div className="relative flex items-center">
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="railway (or kotwali)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 pr-36 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                required
              />
              <span className="absolute right-3 text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 pointer-events-none">
                @ctpl.gov.pk
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative flex items-center">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 pr-20 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 transition"
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-cyan-600/25 tracking-wide disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal \u2192'}
          </button>
        </form>
      </div>

      {/* Prominent Footer Credits */}
      <footer className="bg-slate-950 py-6 px-4 text-slate-300">
        <div className="max-w-[98%] mx-auto flex flex-col items-center justify-center text-center space-y-3">
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 px-6 py-4 rounded-3xl shadow-2xl w-full max-w-xl">
            <p className="text-sm font-medium text-slate-300">
              Designed and developed by <span className="text-cyan-400 font-bold tracking-wide">Traffic Warden Muhammad Afzal Bhatti</span>
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Full Stack Developer / Mobile App Developer
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
              <span className="text-slate-400">For Assistance please contact on WhatsApp:</span>
              <span className="text-cyan-300 font-mono font-bold tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                0333-4080780 &nbsp;|&nbsp; 0321-7310009
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            © 2026 City Traffic Police Lahore (CTPL). All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}