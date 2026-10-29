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

const FULL_SECTORS_LIST = [
  { sector: 'Railway station', zone: 'City Zone', division: 'City', circle: 'City' },
  { sector: 'KOTWALI', zone: 'City Zone', division: 'City', circle: 'City' },
  { sector: 'MISRI SHAH', zone: 'City Zone', division: 'City', circle: 'City' },
  { sector: 'Saggian', zone: 'City Zone', division: 'City', circle: 'Saggian' },
  { sector: 'Band Road', zone: 'City Zone', division: 'City', circle: 'Saggian' },
  { sector: 'Ravi Road', zone: 'City Zone', division: 'City', circle: 'Shahdara' },
  { sector: 'Lari Ada', zone: 'City Zone', division: 'City', circle: 'Shahdara' },
  { sector: 'Shahdara', zone: 'City Zone', division: 'City', circle: 'Shahdara' },
  { sector: 'Garhi Shahu', zone: 'City Zone', division: 'Civil Line', circle: 'Civil Line' },
  { sector: 'Mackleod Road', zone: 'City Zone', division: 'Civil Line', circle: 'Civil Line' },
  { sector: 'Shalimar', zone: 'City Zone', division: 'Civil Line', circle: 'Manawan' },
  { sector: 'Mughalpura', zone: 'City Zone', division: 'Civil Line', circle: 'Manawan' },
  { sector: 'Wagha', zone: 'City Zone', division: 'Civil Line', circle: 'Manawan' },
  { sector: 'Lower Mall', zone: 'City Zone', division: 'Civil Line', circle: 'Anarkali' },
  { sector: 'Anarkali', zone: 'City Zone', division: 'Civil Line', circle: 'Anarkali' },
  { sector: 'Mall-III', zone: 'City Zone', division: 'Civil Line', circle: 'Anarkali' },
  { sector: 'Ichra', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Ichra' },
  { sector: 'Mozang', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Ichra' },
  { sector: 'Wahdat Road', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Nawankot' },
  { sector: 'Nawankot', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Nawankot' },
  { sector: 'Multan Road', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Nawankot' },
  { sector: 'Sherakot', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Nawankot' },
  { sector: 'Mall-I', zone: 'Saddar Zone', division: 'Cantt', circle: 'Cantt' },
  { sector: 'Mall-II', zone: 'Saddar Zone', division: 'Cantt', circle: 'Cantt' },
  { sector: 'Cantt', zone: 'Saddar Zone', division: 'Cantt', circle: 'Cantt' },
  { sector: 'Defence-B', zone: 'Saddar Zone', division: 'Cantt', circle: 'Defence Raya' },
  { sector: 'Bedian', zone: 'Saddar Zone', division: 'Cantt', circle: 'Defence Raya' },
  { sector: 'Defence-A', zone: 'Saddar Zone', division: 'Cantt', circle: 'Airport' },
  { sector: 'Old Airport', zone: 'Saddar Zone', division: 'Cantt', circle: 'Airport' },
  { sector: 'Walton', zone: 'Saddar Zone', division: 'Cantt', circle: 'Airport' },
  { sector: 'New Airport', zone: 'Saddar Zone', division: 'Cantt', circle: 'Airport' },
  { sector: 'Model Town', zone: 'Saddar Zone', division: 'Model Town', circle: 'Model Town' },
  { sector: 'Kot Lakhpat', zone: 'Saddar Zone', division: 'Model Town', circle: 'Model Town' },
  { sector: 'Kahna', zone: 'Saddar Zone', division: 'Model Town', circle: 'Model Town' },
  { sector: 'gulberg', zone: 'Saddar Zone', division: 'Model Town', circle: 'Gulberg' },
  { sector: 'Main Market', zone: 'Saddar Zone', division: 'Model Town', circle: 'Gulberg' },
  { sector: 'Shadman', zone: 'Saddar Zone', division: 'Model Town', circle: 'Gulberg' },
  { sector: 'Township', zone: 'Saddar Zone', division: 'Saddar', circle: 'Township' },
  { sector: 'Green Town', zone: 'Saddar Zone', division: 'Saddar', circle: 'Township' },
  { sector: 'Raiwind', zone: 'Saddar Zone', division: 'Saddar', circle: 'Saddar' },
  { sector: 'Bhobatiyan', zone: 'Saddar Zone', division: 'Saddar', circle: 'Saddar' },
  { sector: 'Kheya Bane Jinnah', zone: 'Saddar Zone', division: 'Saddar', circle: 'Saddar' },
  { sector: 'Johar Town', zone: 'Saddar Zone', division: 'Saddar', circle: 'Johar Town' },
  { sector: 'Niaz Baig', zone: 'Saddar Zone', division: 'Saddar', circle: 'Johar Town' },
  { sector: 'Manga Mandi', zone: 'Saddar Zone', division: 'Saddar', circle: 'Johar Town' }
];

const CIRCLE_TO_TRADITIONAL_SECTORS_MAP: { [key: string]: string[] } = {
  'city': [],
  'saggian': ['SAGGIAN', 'BAND ROAD', 'TRU Saggian (SD)'],
  'shahdara': ['Shahdara', 'Lori Adda', 'SHERAKOT', 'Ravi Road'],
  'civil line': ['Garhi Shahu', 'Mackleod Road'],
  'manawan': ['MUGHALPURA', 'WAHGA', 'Shalimar'],
  'anarkali': ['Lower Mall', 'Anarkali', 'Mall-III'],
  'ichra': ['Ichra', 'Mozang'],
  'nawankot': ['Wahdat Road', 'Nawankot', 'Multan Road', 'SHERAKOT'],
  'cantt': ['Mall-I', 'Mall-II', 'Cantt'],
  'defence raya': ['Defence-B', 'Bedian'],
  'airport': ['Defence-A', 'Old Airport', 'Walton', 'New Airport'],
  'model town': ['KAHNA', 'Model Town', 'Kot Lakhpat'],
  'gulberg': ['gulberg', 'Main Market', 'Shadman'],
  'township': ['Township', 'Green Town'],
  'saddar': ['Raiwind', 'Bhobatiyan', 'Kheya Bane Jinnah'],
  'johar town': ['Niaz Baig', 'Manga Mandi', 'Johar Town']
};

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

export default function CircleDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [vehicleLogs, setVehicleLogs] = useState<any[]>([]);
  
  const [allAttendanceHistory, setAllAttendanceHistory] = useState<any[]>([]);
  const [allVehicleHistory, setAllVehicleHistory] = useState<any[]>([]);
  const [historyTab, setHistoryTab] = useState<'section1' | 'section2'>('section2');

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchCircleData = async () => {
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

      if (error || !profile || profile.role !== 'circle_reader') {
        setErrorMsg('Unauthorized access or profile not found.');
        setLoading(false);
        return;
      }

      setCurrentUser(profile);

      const circleName = profile.jurisdiction ? profile.jurisdiction.trim().toLowerCase() : '';
      const circleKey = circleName; // Defined here before usage

      const concernedSectors = FULL_SECTORS_LIST.filter(
        s => s.circle.trim().toLowerCase() === circleName
      ).map(s => s.sector);

      if (concernedSectors.length > 0) {
        const { data: attData } = await supabase
          .from('section2_attendance_logs')
          .select('*')
          .eq('entry_date', selectedDate)
          .in('sector', concernedSectors);

        if (attData) setAttendanceLogs(attData);

        const tradSectors = CIRCLE_TO_TRADITIONAL_SECTORS_MAP[circleKey] || [];
        if (tradSectors.length > 0) {
          const { data: vehData } = await supabase
            .from('section1_vehicle_logs')
            .select('*')
            .eq('entry_date', selectedDate)
            .in('sector_name', tradSectors);

          if (vehData) setVehicleLogs(vehData);
        }

        const { data: allAtt } = await supabase
          .from('section2_attendance_logs')
          .select('*')
          .in('sector', concernedSectors)
          .order('entry_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (allAtt) setAllAttendanceHistory(allAtt);

        if (tradSectors.length > 0) {
          const { data: allVeh } = await supabase
            .from('section1_vehicle_logs')
            .select('*')
            .in('sector_name', tradSectors)
            .order('entry_date', { ascending: false })
            .order('created_at', { ascending: false });

          if (allVeh) setAllVehicleHistory(allVeh);
        }
      }

      setLoading(false);
    };

    fetchCircleData();
  }, [router, selectedDate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading || !selectedDate) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Loading Circle Oversight Portal...
      </div>
    );
  }

  const assignedCircle = currentUser?.jurisdiction || '';
  const circleKey = assignedCircle.trim().toLowerCase();
  const hasTraditionalSectors = (CIRCLE_TO_TRADITIONAL_SECTORS_MAP[circleKey] || []).length > 0;
  
  const mySectors = FULL_SECTORS_LIST.filter(
    s => s.circle.trim().toLowerCase() === circleKey
  );

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
              <h1 className="text-xl font-black tracking-tight text-white">Circle Data Entry & Oversight Portal</h1>
              <p className="text-xs text-cyan-400 font-medium">
                Assigned Circle: <span className="font-bold text-white uppercase">{assignedCircle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex flex-col text-left px-4 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl shadow-inner">
                <span className="text-xs font-bold text-cyan-400">{currentUser.full_name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Circle Reader
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
              className="px-3.5 py-2 rounded-xl bg-rose-600/25 hover:bg-rose-600/35 border border-rose-500/30 text-rose-300 text-xs font-semibold transition shadow flex items-center gap-1.5"
            >
              🔒 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8 my-6">
        
        {/* Controls & Date Picker Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Subordinate Sectors Monitoring</h2>
            <p className="text-xs text-slate-400 mt-0.5">Observing operational reports for all sectors under {assignedCircle} Circle.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Select Date:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onClick={(e) => {
                try {
                  (e.target as HTMLInputElement).showPicker();
                } catch (err) {}
              }}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-500 font-mono cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* SECTION-1: Vehicle Inspection Logs Summary (Selected Date) - CONDITIONAL BASED ON JURISDICTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Section-1: Vehicle Inspection Logs ({selectedDate})</h3>
              <p className="text-xs text-slate-400 mt-1">Commercial vehicle audit logs recorded by your assigned circle sectors for the selected date.</p>
            </div>
            {hasTraditionalSectors ? (
              <Link 
                href="/section1" 
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold transition"
              >
                + Add Vehicle Log
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 text-xs font-semibold cursor-not-allowed">
                Not Applicable
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            {!hasTraditionalSectors ? (
              <p className="text-xs text-slate-500 text-center py-6">Section-1 vehicle audits are not applicable to your circle jurisdiction.</p>
            ) : vehicleLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No vehicle inspection logs recorded for this date in your assigned circle.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-3 px-4">Sector Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Reg No.</th>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">License / CNIC</th>
                    <th className="py-3 px-4">Action Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {vehicleLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/50 transition">
                      <td className="py-3 px-4 font-bold text-cyan-400">{log.sector_name}</td>
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
        </div>

        {/* SECTION-2: Attendance & Nil Diary Status Table (Selected Date) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-black text-white tracking-tight">Section-2: Attendance & Nil Diary Status ({selectedDate})</h3>
            <p className="text-xs text-slate-400 mt-1">Live submission status across your assigned circle sectors for the selected date.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-4">Sector Name</th>
                  <th className="py-3 px-4">Division / Zone</th>
                  <th className="py-3 px-4">Diary Status</th>
                  <th className="py-3 px-4">Total Posted</th>
                  <th className="py-3 px-4">Active Officers</th>
                  <th className="py-3 px-4">Nil Reason / Breakdown</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {mySectors.map((item, idx) => {
                  const log = attendanceLogs.find(
                    l => l.sector.toLowerCase() === item.sector.toLowerCase()
                  );

                  let breakdown: any = {};
                  try {
                    if (log && log.nil_reason) {
                      breakdown = JSON.parse(log.nil_reason);
                    }
                  } catch (e) {}

                  return (
                    <tr key={idx} className="hover:bg-slate-950/50 transition">
                      <td className="py-3 px-4 font-bold text-white">{item.sector}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{item.division} / {item.zone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] border ${log ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>
                          {log ? log.diary_status : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{log ? log.total_strength : '-'}</td>
                      <td className="py-3 px-4 font-bold text-cyan-400">{log ? log.present_strength : '-'}</td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {log ? (
                          <div>
                            <div>Rest/Leave: {breakdown.restLeave || 0} | Absent: {breakdown.absent || 0}</div>
                            {breakdown.specialDuty?.fig > 0 && <div>Special Duty: {breakdown.specialDuty.fig}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-600">No report submitted</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link 
                          href="/section2" 
                          className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold transition"
                        >
                          {log ? 'Edit / Update' : '+ Submit Report'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FULL HISTORICAL SUBMISSIONS ARCHIVE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Circle Submission History & Archives</h3>
              <p className="text-xs text-slate-400 mt-1">Review all past submitted entries across your assigned circle sectors.</p>
            </div>
            
            {/* History Tab Switcher */}
            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {hasTraditionalSectors && (
                <button 
                  onClick={() => setHistoryTab('section1')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${historyTab === 'section1' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Section-1 Vehicle Logs ({allVehicleHistory.length})
                </button>
              )}
              <button 
                onClick={() => setHistoryTab('section2')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${historyTab === 'section2' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Section-2 Attendance ({allAttendanceHistory.length})
              </button>
            </div>
          </div>

          {/* Section-1 Vehicle Logs History Table */}
          {hasTraditionalSectors && historyTab === 'section1' && (
            <div className="overflow-x-auto">
              {allVehicleHistory.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No historical vehicle inspection records found for your assigned circle.</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Sector</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Reg No.</th>
                      <th className="py-3 px-4">Driver Name</th>
                      <th className="py-3 px-4">Action Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {allVehicleHistory.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-950/50 transition">
                        <td className="py-3 px-4 font-bold text-cyan-400">{log.entry_date}</td>
                        <td className="py-3 px-4 font-bold text-white">{log.sector_name}</td>
                        <td className="py-3 px-4">{log.vehicle_category}</td>
                        <td className="py-3 px-4 font-bold text-white">{log.registration_no}</td>
                        <td className="py-3 px-4">{log.driver_name}</td>
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

          {/* Section-2 Attendance History Table */}
          {historyTab === 'section2' && (
            <div className="overflow-x-auto">
              {allAttendanceHistory.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No historical attendance records found for your assigned circle.</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Sector</th>
                      <th className="py-3 px-4">Diary Status</th>
                      <th className="py-3 px-4">Total Posted</th>
                      <th className="py-3 px-4">Active Officers</th>
                      <th className="py-3 px-4">Breakdown Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {allAttendanceHistory.map((log) => {
                      let breakdown: any = {};
                      try {
                        breakdown = JSON.parse(log.nil_reason || '{}');
                      } catch (e) {}

                      return (
                        <tr key={log.id} className="hover:bg-slate-950/50 transition">
                          <td className="py-3 px-4 font-bold text-cyan-400">{log.entry_date}</td>
                          <td className="py-3 px-4 font-bold text-white">{log.sector}</td>
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