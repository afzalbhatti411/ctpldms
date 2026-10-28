'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface UserProfile {
  full_name: string;
  role: string;
  jurisdiction: string;
}

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setSuccessMsg('Password updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Security: Change Password</h3>
            <p className="text-xs text-slate-400 mt-0.5">Update your account credentials.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold bg-slate-800 h-8 w-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
            <input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none transition"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-lg shadow-cyan-600/25 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SectorDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // States to hold today's submission status and historical logs for this sector
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [todayVehicleCount, setTodayVehicleCount] = useState(0);
  const [section1Logs, setSection1Logs] = useState<any[]>([]);
  const [section2Logs, setSection2Logs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'section1' | 'section2'>('section1');

  useEffect(() => {
    const fetchUserAndSectorData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, role, jurisdiction')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        setErrorMsg('Failed to load user profile jurisdiction.');
        setLoading(false);
        return;
      }

      setCurrentUser(profile);

      // Fetch today's data specifically for this sector's jurisdiction
      const todayIso = new Date().toISOString().split('T')[0];
      const cleanJurisdiction = profile.jurisdiction.trim();

      // 1. Fetch Section 2 Attendance using robust wildcard case-insensitive matching
      const { data: attData } = await supabase
        .from('section2_attendance_logs')
        .select('*')
        .eq('entry_date', todayIso)
        .ilike('sector', `%${cleanJurisdiction}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (attData) {
        setTodayAttendance(attData);
      }

      // 2. Count Section 1 Vehicles for this sector today
      const { count } = await supabase
        .from('section1_vehicle_logs')
        .select('*', { count: 'exact', head: true })
        .eq('entry_date', todayIso)
        .ilike('sector_name', `%${cleanJurisdiction}%`);

      if (count !== null) setTodayVehicleCount(count);

      // 3. Fetch ALL historical Section 1 logs for this sector
      const { data: s1Data } = await supabase
        .from('section1_vehicle_logs')
        .select('*')
        .ilike('sector_name', `%${cleanJurisdiction}%`)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (s1Data) setSection1Logs(s1Data);

      // 4. Fetch ALL historical Section 2 attendance logs for this sector
      const { data: s2Data } = await supabase
        .from('section2_attendance_logs')
        .select('*')
        .ilike('sector', `%${cleanJurisdiction}%`)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (s2Data) setSection2Logs(s2Data);

      setLoading(false);
    };

    fetchUserAndSectorData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Verifying sector authorization...
      </div>
    );
  }

  // Parse nil reason breakdown if available for today
  let parsedNil: any = {};
  try {
    if (todayAttendance && todayAttendance.nil_reason) {
      parsedNil = JSON.parse(todayAttendance.nil_reason);
    }
  } catch (e) {}

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-8 py-6 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg border border-cyan-400/30 p-1">
              <img src="/ctpl-logo.png" alt="CTPL Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Sector Operational Portal</h1>
              <p className="text-xs text-cyan-400 font-medium">
                Assigned Jurisdiction: <span className="font-bold text-white uppercase">{currentUser?.jurisdiction}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex flex-col text-left px-4 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl shadow-inner">
                <span className="text-xs font-bold text-cyan-400">{currentUser.full_name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition shadow flex items-center gap-1.5"
            >
              🔑 Change Password
            </button>
            <button 
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 text-xs font-semibold transition shadow flex items-center gap-1.5"
            >
              🔒 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8 my-6">
        
        <div className="text-center space-y-2 mb-2">
          <h2 className="text-2xl font-black text-white tracking-tight">Field Data Entry & Submission Hub</h2>
          <p className="text-xs text-slate-400">Select the required section wizard below to submit daily reports for your sector.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Wizard Action Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section-1 Tile */}
          <div className="group bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-8 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-3.5 bg-blue-500/10 text-blue-400 rounded-2xl font-bold text-2xl border border-blue-500/20 shadow-inner">🚛</span>
                <span className="text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3.5 py-1 rounded-full font-mono uppercase">Commercial Vehicle Logs</span>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-blue-300 transition tracking-tight">Section-1: Vehicle Inspection Wizard</h3>
              <p className="text-xs text-slate-400 mt-2.5 mb-8 leading-relaxed">Submit commercial vehicle inspection records, safety audits, and driver verifications.</p>
            </div>
            <Link href="/section1" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-xs transition shadow-lg tracking-wide">
              Launch Section-1 Inspection Wizard &rarr;
            </Link>
          </div>

          {/* Section-2 Tile */}
          <div className="group bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-8 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-2xl font-bold text-2xl border border-cyan-500/20 shadow-inner">📋</span>
                <span className="text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3.5 py-1 rounded-full font-mono uppercase">Attendance & Nil Diary</span>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition tracking-tight">Section-2: Attendance & Diary Wizard</h3>
              <p className="text-xs text-slate-400 mt-2.5 mb-8 leading-relaxed">Submit daily strength figures, rest/leave records, and structured Nil Diary breakdown logs.</p>
            </div>
            <Link href="/section2" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl text-xs transition shadow-lg tracking-wide">
              Launch Section-2 Entry Wizard &rarr;
            </Link>
          </div>

        </div>

        {/* LIVE SUBMISSION STATUS PREVIEW FOR THIS SECTOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-black text-white tracking-tight">Today's Submission Status for {currentUser?.jurisdiction}</h3>
            <p className="text-xs text-slate-400 mt-1">Review what has been recorded into the central database from your sector today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section 1 Status Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">Section-1 Vehicle Inspections</span>
                <span className="text-xs font-mono bg-blue-500/10 text-blue-300 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  {todayVehicleCount} Logs Recorded
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {todayVehicleCount > 0 
                  ? 'Your vehicle inspection records have been successfully submitted for today.' 
                  : 'No vehicle inspection logs submitted yet for today.'}
              </p>
            </div>

            {/* Section 2 Status Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Section-2 Attendance & Diary</span>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${todayAttendance ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>
                  {todayAttendance ? 'Submitted' : 'Pending Submission'}
                </span>
              </div>
              {todayAttendance ? (
                <div className="text-xs text-slate-300 space-y-1 pt-1 font-mono">
                  <div>Total Posted: <span className="text-white font-bold">{parsedNil.totalPosted || 0}</span></div>
                  <div>Rest / Leave: <span className="text-white font-bold">{parsedNil.restLeave || 0}</span></div>
                  <div>Absent: <span className="text-white font-bold">{parsedNil.absent || 0}</span></div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Attendance report has not been filed for today yet.</p>
              )}
            </div>

          </div>
        </div>

        {/* HISTORICAL SUBMISSIONS ARCHIVE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Sector Submission History & Archives</h3>
              <p className="text-xs text-slate-400 mt-1">Review all past submitted entries date-wise with complete details.</p>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button 
                onClick={() => setActiveTab('section1')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'section1' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Section-1 Logs ({section1Logs.length})
              </button>
              <button 
                onClick={() => setActiveTab('section2')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'section2' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Section-2 Attendance ({section2Logs.length})
              </button>
            </div>
          </div>

          {/* Section 1 History Table */}
          {activeTab === 'section1' && (
            <div className="overflow-x-auto">
              {section1Logs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No historical vehicle inspection logs found for this sector.</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Reg No.</th>
                      <th className="py-3 px-4">Driver Name</th>
                      <th className="py-3 px-4">License / CNIC</th>
                      <th className="py-3 px-4">Action Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {section1Logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-950/50 transition">
                        <td className="py-3 px-4 font-bold text-cyan-400">{log.entry_date}</td>
                        <td className="py-3 px-4">{log.vehicle_category}</td>
                        <td className="py-3 px-4 font-bold text-white">{log.registration_no}</td>
                        <td className="py-3 px-4">{log.driver_name}</td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">{log.driver_license_no} <br /> {log.driver_cnic}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px]">
                            {log.action_taken}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Section 2 History Table */}
          {activeTab === 'section2' && (
            <div className="overflow-x-auto">
              {section2Logs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No historical attendance/diary logs found for this sector.</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Diary Status</th>
                      <th className="py-3 px-4">Total Posted</th>
                      <th className="py-3 px-4">Active Officers</th>
                      <th className="py-3 px-4">Breakdown Details (Rest/Leave / Absent / Nil)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {section2Logs.map((log) => {
                      let breakdown: any = {};
                      try {
                        breakdown = JSON.parse(log.nil_reason || '{}');
                      } catch (e) {}

                      return (
                        <tr key={log.id} className="hover:bg-slate-950/50 transition">
                          <td className="py-3 px-4 font-bold text-cyan-400">{log.entry_date}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] border ${log.diary_status === 'Active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>
                              {log.diary_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-white">{log.total_strength}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">{log.present_strength}</td>
                          <td className="py-3 px-4 text-[11px] text-slate-400 leading-relaxed">
                            <div>Rest/Leave: <span className="text-white">{breakdown.restLeave || 0}</span> | Absent: <span className="text-white">{breakdown.absent || 0}</span></div>
                            {breakdown.specialDuty?.fig > 0 && <div>Special Duty: {breakdown.specialDuty.fig} ({breakdown.specialDuty.details})</div>}
                            {breakdown.mobileIssue?.fig > 0 && <div>Mobile Issue: {breakdown.mobileIssue.fig} ({breakdown.mobileIssue.details})</div>}
                            {breakdown.loginAppIssue?.fig > 0 && <div>App Issue: {breakdown.loginAppIssue.fig} ({breakdown.loginAppIssue.details})</div>}
                            {breakdown.withoutReason?.fig > 0 && <div>Without Reason: {breakdown.withoutReason.fig} ({breakdown.withoutReason.details})</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>

      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

    </div>
  );
}