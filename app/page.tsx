'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface VehicleLog {
  entry_date: string;
  sector_name: string;
  vehicle_category: string;
  company_adda_name: string;
  registration_no: string;
  driver_name: string;
  driver_license_no: string;
  driver_cnic: string;
  engine_chassis_verified: string;
  route_permit: string;
  fitness_certificate: string;
  back_light: string;
  reflecting_tape: string;
  driver_uniform_briefed: string;
  action_taken: string;
}

interface AttendanceLog {
  entry_date: string;
  zone: string;
  division: string;
  circle: string;
  sector: string;
  total_strength: number;
  present_strength: number;
  diary_status: string;
  nil_reason: string;
}

interface UserProfile {
  full_name: string;
  role: string;
  jurisdiction: string;
}

const TRADITIONAL_SECTORS = [
  'BAND ROAD', 'SAGGIAN', 'SHERAKOT', 'Lori Adda', 'Shahdara', 
  'MUGHALPURA', 'WAHGA', 'Niaz Baig', 'Manga Mandi', 
  'Raiwind', 'Bhobatian', 'KAHNA', 'TRU Saggian (SD)'
];

const FULL_SECTORS_LIST = [
  // Block 1 (Sectors 1-8)
  { sr: 1, sector: 'Railway station', block: 'City' },
  { sr: 2, sector: 'KOTWALI', block: 'City' },
  { sr: 3, sector: 'MISRI SHAH', block: 'City' },
  { sr: 4, sector: 'Saggian', block: 'City' },
  { sr: 5, sector: 'Band Road', block: 'City' },
  { sr: 6, sector: 'Ravi Road', block: 'City' },
  { sr: 7, sector: 'Lari Ada', block: 'City' },
  { sr: 8, sector: 'Shahdara', block: 'City' },
  // Block 2 (Sectors 9-16)
  { sr: 9, sector: 'Garhi Shahu', block: 'Civil Line' },
  { sr: 10, sector: 'Mackleod Road', block: 'Civil Line' },
  { sr: 11, sector: 'Shalimar', block: 'Civil Line' },
  { sr: 12, sector: 'Mughalpura', block: 'Civil Line' },
  { sr: 13, sector: 'Wagha', block: 'Civil Line' },
  { sr: 14, sector: 'Lower Mall', block: 'Civil Line' },
  { sr: 15, sector: 'Anarkali', block: 'Civil Line' },
  { sr: 16, sector: 'Mall-III', block: 'Civil Line' },
  // Block 3 (Sectors 17-22)
  { sr: 17, sector: 'Ichra', block: 'Allama Iqbal Town' },
  { sr: 18, sector: 'Mozang', block: 'Allama Iqbal Town' },
  { sr: 19, sector: 'Wahdat Road', block: 'Allama Iqbal Town' },
  { sr: 20, sector: 'Nawankot', block: 'Allama Iqbal Town' },
  { sr: 21, sector: 'Multan Road', block: 'Allama Iqbal Town' },
  { sr: 22, sector: 'Sherakot', block: 'Allama Iqbal Town' },
  // Block 4 (Sectors 23-31)
  { sr: 23, sector: 'Mall-I', block: 'Cantt' },
  { sr: 24, sector: 'Mall-II', block: 'Cantt' },
  { sr: 25, sector: 'Cantt', block: 'Cantt' },
  { sr: 26, sector: 'Defence-B', block: 'Cantt' },
  { sr: 27, sector: 'Bedian', block: 'Cantt' },
  { sr: 28, sector: 'Defence-A', block: 'Cantt' },
  { sr: 29, sector: 'Old Airport', block: 'Cantt' },
  { sr: 30, sector: 'Walton', block: 'Cantt' },
  { sr: 31, sector: 'New Airport', block: 'Cantt' },
  // Block 5 (Sectors 32-37)
  { sr: 32, sector: 'Model Town', block: 'Model Town' },
  { sr: 33, sector: 'Kot Lakhpat', block: 'Model Town' },
  { sr: 34, sector: 'Kahna', block: 'Model Town' },
  { sr: 35, sector: 'gulberg', block: 'Model Town' },
  { sr: 36, sector: 'Main Market', block: 'Model Town' },
  { sr: 37, sector: 'Shadman', block: 'Model Town' },
  // Block 6 (Sectors 38-45)
  { sr: 38, sector: 'Township', block: 'Saddar' },
  { sr: 39, sector: 'Green Town', block: 'Saddar' },
  { sr: 40, sector: 'Raiwind', block: 'Saddar' },
  { sr: 41, sector: 'Bhobatiyan', block: 'Saddar' },
  { sr: 42, sector: 'Kheya Bane Jinnah', block: 'Saddar' },
  { sr: 43, sector: 'Johar Town', block: 'Saddar' },
  { sr: 44, sector: 'Niaz Baig', block: 'Saddar' },
  { sr: 45, sector: 'Manga Mandi', block: 'Saddar' }
];

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Security: Change Password</h3>
            <p className="text-xs text-slate-400 mt-0.5">Update your Reader Branch Admin credentials.</p>
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
          {/* New Password Field with Show/Hide Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border-2 border-cyan-500/60 bg-slate-950 p-3 pr-20 text-base text-white font-bold tracking-wider placeholder-slate-500 focus:border-cyan-400 outline-none transition shadow-inner"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white text-xs font-mono bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition shadow"
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field with Show/Hide Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border-2 border-cyan-500/60 bg-slate-950 p-3 pr-20 text-base text-white font-bold tracking-wider placeholder-slate-500 focus:border-cyan-400 outline-none transition shadow-inner"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white text-xs font-mono bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition shadow"
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
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

export default function MainDashboard() {
  const router = useRouter();
  const [logs, setLogs] = useState<VehicleLog[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [currentDateFormatted, setCurrentDateFormatted] = useState('');
  const [todayIsoDate, setTodayIsoDate] = useState('');
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, jurisdiction')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (!['super_admin', 'section1_admin', 'section2_admin'].includes(profile.role)) {
            router.push('/sector-dashboard');
            return;
          }

          setCurrentUser(profile);
        }

        setAuthChecking(false);
        fetchAllData();
      }
    };

    checkUser();

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    setCurrentDateFormatted(`${day}-${month}-${year}`);
    setTodayIsoDate(now.toISOString().split('T')[0]);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const fetchAllData = async () => {
    try {
      const { data: sec1Data, error: sec1Error } = await supabase.from('section1_vehicle_logs').select('*');
      if (sec1Error) throw sec1Error;
      if (sec1Data) setLogs(sec1Data);

      const { data: sec2Data, error: sec2Error } = await supabase.from('section2_attendance_logs').select('*');
      if (sec2Error) throw sec2Error;
      if (sec2Data) setAttendanceLogs(sec2Data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err.message);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Verifying security session...
      </div>
    );
  }

  const sectorSummary = TRADITIONAL_SECTORS.map((sector, index) => {
    const sectorLogs = logs.filter(log => 
      log.sector_name.toUpperCase() === sector.toUpperCase() && 
      log.entry_date === todayIsoDate
    );

    const total = sectorLogs.length;
    const dump = sectorLogs.filter(l => l.vehicle_category === 'Dump').length;
    const trailer = sectorLogs.filter(l => l.vehicle_category === '22 Wheeler / Trailer').length;
    const truck = sectorLogs.filter(l => l.vehicle_category === 'Truck').length;
    const busCoaster = sectorLogs.filter(l => l.vehicle_category === 'Bus / Coaster').length;
    const pickUp = sectorLogs.filter(l => l.vehicle_category === 'Pick Up').length;
    const mazda = sectorLogs.filter(l => l.vehicle_category === 'Mazda').length;

    const driverNameCount = sectorLogs.filter(l => l.driver_name).length;
    const licenseCount = sectorLogs.filter(l => l.driver_license_no).length;
    const cnicCount = sectorLogs.filter(l => l.driver_cnic).length;
    const regCount = sectorLogs.filter(l => l.registration_no).length;
    
    const engineVerified = sectorLogs.filter(l => l.engine_chassis_verified === 'YES').length;
    const routePermit = sectorLogs.filter(l => l.route_permit === 'YES').length;
    const fitnessCert = sectorLogs.filter(l => l.fitness_certificate === 'YES').length;
    const backlight = sectorLogs.filter(l => l.back_light === 'YES').length;
    const reflectingTape = sectorLogs.filter(l => l.reflecting_tape === 'YES').length;
    const uniformBriefed = sectorLogs.filter(l => l.driver_uniform_briefed === 'YES').length;
    const challanIssued = sectorLogs.filter(l => l.action_taken === 'Challan Issued').length;

    return {
      srNo: index + 1, sectorName: sector, total, dump, trailer, truck, busCoaster, pickUp, mazda,
      driverNameCount, licenseCount, cnicCount, regCount, engineVerified, routePermit, fitnessCert,
      backlight, reflectingTape, uniformBriefed, challanIssued
    };
  });

  const todayTotals = sectorSummary.reduce((acc, curr) => ({
    total: acc.total + curr.total, dump: acc.dump + curr.dump, trailer: acc.trailer + curr.trailer,
    truck: acc.truck + curr.truck, busCoaster: acc.busCoaster + curr.busCoaster, pickUp: acc.pickUp + curr.pickUp,
    mazda: acc.mazda + curr.mazda, driverNameCount: acc.driverNameCount + curr.driverNameCount,
    licenseCount: acc.licenseCount + curr.licenseCount, cnicCount: acc.cnicCount + curr.cnicCount,
    regCount: acc.regCount + curr.regCount, engineVerified: acc.engineVerified + curr.engineVerified,
    routePermit: acc.routePermit + curr.routePermit, fitnessCert: acc.fitnessCert + curr.fitnessCert,
    backlight: acc.backlight + curr.backlight, reflectingTape: acc.reflectingTape + curr.reflectingTape,
    uniformBriefed: acc.uniformBriefed + curr.uniformBriefed, challanIssued: acc.challanIssued + curr.challanIssued,
  }), {
    total: 0, dump: 0, trailer: 0, truck: 0, busCoaster: 0, pickUp: 0, mazda: 0,
    driverNameCount: 0, licenseCount: 0, cnicCount: 0, regCount: 0,
    engineVerified: 0, routePermit: 0, fitnessCert: 0, backlight: 0,
    reflectingTape: 0, uniformBriefed: 0, challanIssued: 0
  });

  const downloadRawLogsCsv = () => {
    const todayLogs = logs.filter(l => l.entry_date === todayIsoDate);
    if (todayLogs.length === 0) {
      alert('No raw logs found for today.');
      return;
    }

    const headers = ['Date', 'Sector', 'Category', 'Company/Adda', 'Registration No', 'Driver Name', 'License No', 'CNIC', 'Engine Verified', 'Route Permit', 'Fitness Cert', 'Back Light', 'Reflecting Tape', 'Driver Briefed', 'Action Taken'];
    const rows = todayLogs.map(l => [
      l.entry_date, l.sector_name, l.vehicle_category, l.company_adda_name, l.registration_no,
      l.driver_name, l.driver_license_no, l.driver_cnic, l.engine_chassis_verified, l.route_permit,
      l.fitness_certificate, l.back_light, l.reflecting_tape, l.driver_uniform_briefed, l.action_taken
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Section1_Raw_Logs_${currentDateFormatted}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAggregatedMatrixCsv = () => {
    const headers = ['Sr No', 'Sector Name', 'Total', 'Dumper', '22 Wheeler', 'Truck', 'Bus/Coaster', 'Pick Up', 'Mazda', 'Driver Name', 'License No', 'CNIC No', 'Registration No', 'Engine Verified', 'Route Permit', 'Fitness Cert', 'Back Light', 'Reflecting Tape', 'Driver Briefed', 'Action Taken'];
    const rows = sectorSummary.map(r => [
      r.srNo, r.sectorName, r.total, r.dump, r.trailer, r.truck, r.busCoaster, r.pickUp, r.mazda,
      r.driverNameCount, r.licenseCount, r.cnicCount, r.regCount, r.engineVerified, r.routePermit,
      r.fitnessCert, r.backlight, r.reflectingTape, r.uniformBriefed, r.challanIssued
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Section1_Aggregated_Matrix_${currentDateFormatted}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSection2Csv = () => {
    const todaySec2 = attendanceLogs.filter(l => l.entry_date === todayIsoDate);
    if (todaySec2.length === 0) {
      alert('No Section 2 attendance records found for today.');
      return;
    }

    const headers = ['Sr No', 'Sector Name', 'Zone', 'Division', 'Circle', 'Total Posted', 'Rest/Leave', 'Absent', 'Special Duty Fig', 'Special Duty Details', 'Mobile Issue Fig', 'Mobile Details', 'Login Issue Fig', 'Login Details', 'Without Reason Fig', 'Without Reason Details', 'Any Other Fig', 'Any Other Details', 'Any Other Reason', 'Nil Diary Total', 'Active Officers'];
    
    const rows = FULL_SECTORS_LIST.map((item, idx) => {
      const match = todaySec2.find(l => l.sector.toLowerCase() === item.sector.toLowerCase());
      let p: any = {};
      try { if (match && match.nil_reason) p = JSON.parse(match.nil_reason); } catch(e) {}

      const tot = parseInt(p.totalPosted) || 0;
      const rest = parseInt(p.restLeave) || 0;
      const abs = parseInt(p.absent) || 0;

      const sdFig = parseInt(p.specialDuty?.fig) || 0;
      const mobFig = parseInt(p.mobileIssue?.fig) || 0;
      const logFig = parseInt(p.loginAppIssue?.fig) || 0;
      const wFig = parseInt(p.withoutReason?.fig) || 0;
      const anyFig = parseInt(p.anyOther?.fig) || 0;
      const nilTotal = sdFig + mobFig + logFig + wFig + anyFig;
      const active = Math.max(0, tot - (rest + abs + nilTotal));

      return [
        item.sr,
        item.sector,
        item.zone,
        item.division,
        item.circle,
        tot || 0,
        rest || 0,
        abs || 0,
        sdFig,
        `"${p.specialDuty?.details || '-'}"`,
        mobFig,
        `"${p.mobileIssue?.details || '-'}"`,
        logFig,
        `"${p.loginAppIssue?.details || '-'}"`,
        wFig,
        `"${p.withoutReason?.details || '-'}"`,
        anyFig,
        `"${p.anyOther?.details || '-'}"`,
        `"${p.anyOther?.reason || '-'}"`,
        nilTotal > 0 ? nilTotal : '-',
        match ? active : '-'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Section2_Digital_Challan_Diary_${currentDateFormatted}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSection2Block = (startIdx: number, endIdx: number) => {
    const blockItems = FULL_SECTORS_LIST.slice(startIdx, endIdx);
    
    let blockTotalPosted = 0;
    let blockRestLeave = 0;
    let blockAbsent = 0;
    let blockNilTotal = 0;
    let blockActiveOfficers = 0;

    const rows = blockItems.map((item, idx) => {
      const match = attendanceLogs.find(l => l.sector.toLowerCase() === item.sector.toLowerCase());
      let parsedReason: any = {};
      try {
        if (match && match.nil_reason) parsedReason = JSON.parse(match.nil_reason);
      } catch (e) {}

      const pTotal = parseInt(parsedReason.totalPosted) || 0;
      const pRest = parseInt(parsedReason.restLeave) || 0;
      const pAbsent = parseInt(parsedReason.absent) || 0;

      const sdFig = parseInt(parsedReason.specialDuty?.fig) || 0;
      const mobFig = parseInt(parsedReason.mobileIssue?.fig) || 0;
      const logFig = parseInt(parsedReason.loginAppIssue?.fig) || 0;
      const wFig = parseInt(parsedReason.withoutReason?.fig) || 0;
      const anyFig = parseInt(parsedReason.anyOther?.fig) || 0;
      
      const sectorNilTotal = sdFig + mobFig + logFig + wFig + anyFig;
      blockNilTotal += sectorNilTotal;

      const sectorActive = match ? Math.max(0, pTotal - (pRest + pAbsent + sectorNilTotal)) : 0;

      blockTotalPosted += pTotal;
      blockRestLeave += pRest;
      blockAbsent += pAbsent;
      blockActiveOfficers += sectorActive;

      return (
        <tr key={idx} className="hover:bg-gray-100 transition-colors border-b border-gray-200 text-gray-800">
          <td className="p-2 border-r border-gray-200 font-medium text-center">{item.sr}</td>
          <td className="p-2 border-r border-gray-200 font-bold text-left pl-3">{item.sector}</td>
          <td className="p-2 border-r border-gray-200 font-semibold text-center">{match ? pTotal || '-' : '-'}</td>
          <td className="p-2 border-r border-gray-200 text-center">{match ? pRest || '-' : '-'}</td>
          <td className="p-2 border-r border-gray-200 text-center">{match ? pAbsent || '-' : '-'}</td>
          
          <td className="p-2 border-r border-gray-200 text-center">{parsedReason.specialDuty?.fig || '-'}</td>
          <td className="p-2 border-r border-gray-200 text-left text-xs">{parsedReason.specialDuty?.details || '-'}</td>
          
          <td className="p-2 border-r border-gray-200 text-center">{parsedReason.mobileIssue?.fig || '-'}</td>
          <td className="p-2 border-r border-gray-200 text-left text-xs">{parsedReason.mobileIssue?.details || '-'}</td>
          
          <td className="p-2 border-r border-gray-200 text-center">{parsedReason.loginAppIssue?.fig || '-'}</td>
          <td className="p-2 border-r border-gray-200 text-left text-xs">{parsedReason.loginAppIssue?.details || '-'}</td>
          
          <td className="p-2 border-r border-gray-200 text-center">{parsedReason.withoutReason?.fig || '-'}</td>
          <td className="p-2 border-r border-gray-200 text-left text-xs">{parsedReason.withoutReason?.details || '-'}</td>
          
          <td className="p-2 border-r border-gray-200 text-center">{parsedReason.anyOther?.fig || '-'}</td>
          <td className="p-2 border-r border-gray-200 text-left text-xs">{parsedReason.anyOther?.details || '-'}</td>
          <td className="p-2 border-r border-gray-200 text-left text-xs">{parsedReason.anyOther?.reason || '-'}</td>

          <td className="p-2 border-r border-gray-200 font-bold text-red-600 text-center">{sectorNilTotal > 0 ? sectorNilTotal : '-'}</td>
          <td className="p-2 font-semibold text-blue-700 text-center">{match ? sectorActive : '-'}</td>
        </tr>
      );
    });

    return (
      <React.Fragment>
        {rows}
        <tr className="bg-slate-200 font-bold text-slate-900 border-t border-b border-slate-300">
          <td className="p-2.5 border-r border-slate-300 text-center" colSpan={2}>Total</td>
          <td className="p-2.5 border-r border-slate-300 text-center">{blockTotalPosted}</td>
          <td className="p-2.5 border-r border-slate-300 text-center">{blockRestLeave}</td>
          <td className="p-2.5 border-r border-slate-300 text-center">{blockAbsent}</td>
          <td className="p-2.5 border-r border-slate-300 text-center" colSpan={11}>-</td>
          <td className="p-2.5 border-r border-slate-300 text-center text-red-700">{blockNilTotal}</td>
          <td className="p-2.5 text-center text-blue-800">{blockActiveOfficers}</td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. EXPANDED ELITE COMMAND HEADER WITH LOGO, USER BADGE & LOGOUT */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-8 py-6 shadow-2xl">
        <div className="max-w-[98%] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30 overflow-hidden p-1">
              <img 
                src="/ctpl-logo.png" 
                alt="CTPL Lahore Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-3">
                CTPL Diary Management System
              </h1>
              <p className="text-xs md:text-sm text-cyan-400 font-medium mt-0.5">
                Daily Diary Reports Portal - Reader Branch CTO Office, Lahore
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Active Date Badge */}
            <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono shadow-inner">
              📅 Active Date: {currentDateFormatted || 'Loading...'}
            </div>

            {/* Logged-In User Badge */}
            {currentUser && (
              <div className="flex flex-col text-left px-4 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl shadow-inner">
                <span className="text-xs font-bold text-cyan-400">{currentUser.full_name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  {currentUser.role.replace('_', ' ')} • {currentUser.jurisdiction}
                </span>
              </div>
            )}

            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition shadow-lg shadow-cyan-600/30 text-xs flex items-center gap-1.5"
            >
              🔑 Change Password
            </button>

            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 text-xs font-semibold transition shadow flex items-center gap-1.5"
            >
              🔒 Logout
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-[98%] w-full mx-auto p-6 space-y-10">
        
        {/* OPERATIONS HUB / ACTION TILES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section-1 Tile (Left) */}
          <div className="group bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-6 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition" />
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl font-bold text-xl border border-blue-500/20 shadow-inner">
                  🚛
                </span>
                <span className="text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  13 Traditional Sectors
                </span>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-blue-300 transition tracking-tight">
                Section-1: Commercial Vehicle Daily Data (HTV/LTV)
              </h3>
              <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
                Track commercial vehicle inspections, safety audits, driver license & CNIC verifications, fitness certificates, and challan enforcement.
              </p>
            </div>
            <Link 
              href="/section1" 
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all duration-300 shadow-lg shadow-blue-600/20 tracking-wide"
            >
              Launch Section-1 Inspection Wizard &rarr;
            </Link>
          </div>

          {/* Section-2 Tile (Right) */}
          <div className="group bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-6 transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition" />
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl font-bold text-xl border border-cyan-500/20 shadow-inner">
                  📋
                </span>
                <span className="text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Official 4-Tier Hierarchy
                </span>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition tracking-tight">
                Section-2: Digital Challan Diary & Attendance
              </h3>
              <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
                Manage official 45-sector attendance, manpower posting figures, medical/rest leaves, and structured Nil Diary breakdown logs.
              </p>
            </div>
            <Link 
              href="/section2" 
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all duration-300 shadow-lg shadow-cyan-600/20 tracking-wide"
            >
              Launch Section-2 Entry Wizard &rarr;
            </Link>
          </div>

        </div>

        {/* SECTION 1 CONTAINER WITH DOWNLOAD BUTTONS */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Section-1: Commercial Vehicle Daily Data (HTV, LTV)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Overview of inspections across 13 traditional sectors</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={downloadRawLogsCsv}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl shadow transition text-xs flex items-center gap-1.5"
              >
                📥 Download Today's Raw Logs (CSV)
              </button>
              <button 
                onClick={downloadAggregatedMatrixCsv}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl shadow transition text-xs flex items-center gap-1.5"
              >
                📊 Download Aggregated Matrix (CSV)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-cyan-600/50 rounded-2xl shadow-2xl bg-white text-gray-900">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th colSpan={20} className="bg-cyan-700 text-white font-black text-base py-4 tracking-wider border-b-2 border-cyan-800 uppercase shadow-md">
                    HTV Checked Vehicle Data • {currentDateFormatted}
                  </th>
                </tr>
                <tr className="bg-cyan-900 text-white font-bold border-b border-cyan-800">
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>Sr. No.</th>
                  <th className="p-3 border-r border-cyan-800 min-w-[140px]" rowSpan={2}>Sector Name</th>
                  <th className="p-3 border-r border-cyan-800" colSpan={7}>Category Breakdown</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>Driver Name</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>License No.</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>CNIC No.</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>Registration No.</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>Engine & Chassis Verified</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>Route Permit</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>Fitness Certificate</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>Back Light</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>Reflecting Tape</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={2}>Driver Briefed</th>
                  <th className="p-3 border-cyan-800" rowSpan={2}>Action Taken</th>
                </tr>
                <tr className="bg-cyan-800 text-white font-bold border-b border-cyan-700 text-[11px]">
                  <th className="p-2 border-r border-cyan-700">Total</th>
                  <th className="p-2 border-r border-cyan-700">Dumper</th>
                  <th className="p-2 border-r border-cyan-700">22 Wheeler</th>
                  <th className="p-2 border-r border-cyan-700">Truck</th>
                  <th className="p-2 border-r border-cyan-700">Bus/Coaster</th>
                  <th className="p-2 border-r border-cyan-700">Pick Up</th>
                  <th className="p-2 border-r border-cyan-700">Mazda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {sectorSummary.map((row) => (
                  <tr key={row.srNo} className="hover:bg-cyan-50/60 transition">
                    <td className="p-2.5 border-r border-gray-200 font-medium">{row.srNo}</td>
                    <td className="p-2.5 border-r border-gray-200 font-bold text-left pl-3">{row.sectorName}</td>
                    <td className="p-2.5 border-r border-gray-200 font-bold bg-cyan-50/50 text-cyan-900">{row.total}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.dump}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.trailer}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.truck}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.busCoaster}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.pickUp}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.mazda}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.driverNameCount}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.licenseCount}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.cnicCount}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.regCount}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.engineVerified}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.routePermit}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.fitnessCert}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.backlight}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.reflectingTape}</td>
                    <td className="p-2.5 border-r border-gray-200">{row.uniformBriefed}</td>
                    <td className="p-2.5 border-gray-200 font-semibold text-red-700">{row.challanIssued}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="font-bold text-white bg-cyan-900 border-t-2 border-cyan-950">
                <tr>
                  <td className="p-3 border-r border-cyan-800 border-b" colSpan={2}>Today Total</td>
                  <td className="p-3 border-r border-cyan-800 border-b text-cyan-300">{todayTotals.total}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.dump}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.trailer}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.truck}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.busCoaster}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.pickUp}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.mazda}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.driverNameCount}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.licenseCount}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.cnicCount}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.regCount}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.engineVerified}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.routePermit}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.fitnessCert}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.backlight}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.reflectingTape}</td>
                  <td className="p-3 border-r border-cyan-800 border-b">{todayTotals.uniformBriefed}</td>
                  <td className="p-3 border-cyan-800 border-b text-rose-300">{todayTotals.challanIssued}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* SECTION 2 CONTAINER */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Section-2: Digital Challan Diary (Nil Diary along with Reason)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Official 45-sector hierarchy sheet format with complete breakdown columns</p>
            </div>
            <div>
              <button 
                onClick={downloadSection2Csv}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-xl shadow transition text-xs flex items-center gap-1.5"
              >
                📥 Download Section-2 Report (CSV)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-cyan-600/50 rounded-2xl shadow-2xl bg-white text-gray-900">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th colSpan={18} className="bg-cyan-700 text-white font-black text-base py-4 tracking-wider border-b-2 border-cyan-800 uppercase shadow-md">
                    Digital Challan Diary Of CTPL • {currentDateFormatted}
                  </th>
                </tr>
                <tr className="bg-cyan-900 text-white font-bold border-b border-cyan-800">
                  <th className="p-3 border-r border-cyan-800 w-[60px]" rowSpan={3}>Sr. No.</th>
                  <th className="p-3 border-r border-cyan-800 w-[140px]" rowSpan={3}>Sector Name</th>
                  <th className="p-3 border-r border-cyan-800 w-[140px] text-[11px]" rowSpan={3}>Total Posted Officers (Without D.O & Lifter)</th>
                  <th className="p-3 border-r border-cyan-800 w-[140px] text-[11px]" rowSpan={3}>Rest / Medical / Leave</th>
                  <th className="p-3 border-r border-cyan-800 w-[140px] text-[11px]" rowSpan={3}>Total Absent</th>
                  <th className="p-3 border-r border-cyan-800" colSpan={11}>Nil Diary With Reason Breakdown</th>
                  <th className="p-3 border-r border-cyan-800" rowSpan={3}>Nil Diary Total</th>
                  <th className="p-3 border-cyan-800" rowSpan={3}>Active Officers</th>
                </tr>
                <tr className="bg-cyan-800 text-white font-bold border-b border-cyan-700 text-[10px]">
                  <th className="p-2 border-r border-cyan-700" colSpan={2}>Special Duty / Attachment</th>
                  <th className="p-2 border-r border-cyan-700" colSpan={2}>Mobile Issue</th>
                  <th className="p-2 border-r border-cyan-700" colSpan={2}>Login / App Issue</th>
                  <th className="p-2 border-r border-cyan-700" colSpan={2}>Without Reason</th>
                  <th className="p-2 border-r border-cyan-700" colSpan={3}>Any Other Reason</th>
                </tr>
                <tr className="bg-cyan-900 text-white font-bold border-b border-cyan-700 text-[9px]">
                  <th className="p-2 border-r border-cyan-700">Fig</th>
                  <th className="p-2 border-r border-cyan-700">Name & Belt No.</th>
                  <th className="p-2 border-r border-cyan-700">Fig</th>
                  <th className="p-2 border-r border-cyan-700">Name & Belt No.</th>
                  <th className="p-2 border-r border-cyan-700">Fig</th>
                  <th className="p-2 border-r border-cyan-700">Name & Belt No.</th>
                  <th className="p-2 border-r border-cyan-700">Fig</th>
                  <th className="p-2 border-r border-cyan-700">Name & Belt No.</th>
                  <th className="p-2 border-r border-cyan-700">Fig</th>
                  <th className="p-2 border-r border-cyan-700">Name & Belt No.</th>
                  <th className="p-2 border-cyan-700">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {renderSection2Block(0, 8)}
                {renderSection2Block(8, 16)}
                {renderSection2Block(16, 22)}
                {renderSection2Block(22, 31)}
                {renderSection2Block(31, 37)}
                {renderSection2Block(37, 45)}
              </tbody>
              <tfoot className="font-extrabold text-white bg-cyan-900 border-t-2 border-cyan-950">
                <tr>
                  <td className="p-3 border-r border-cyan-800 text-center" colSpan={2}>Grand Total</td>
                  <td className="p-3 border-r border-cyan-800 text-center w-[140px] text-cyan-300">
                    {attendanceLogs.reduce((acc, curr) => {
                      try { const p = JSON.parse(curr.nil_reason); return acc + (parseInt(p.totalPosted) || 0); } catch(e) { return acc + curr.total_strength; }
                    }, 0)}
                  </td>
                  <td className="p-3 border-r border-cyan-800 text-center w-[140px]">
                    {attendanceLogs.reduce((acc, curr) => {
                      try { const p = JSON.parse(curr.nil_reason); return acc + (parseInt(p.restLeave) || 0); } catch(e) { return acc; }
                    }, 0)}
                  </td>
                  <td className="p-3 border-r border-cyan-800 text-center w-[140px]">
                    {attendanceLogs.reduce((acc, curr) => {
                      try { const p = JSON.parse(curr.nil_reason); return acc + (parseInt(p.absent) || 0); } catch(e) { return acc; }
                    }, 0)}
                  </td>
                  <td className="p-3 border-r border-cyan-800 text-center" colSpan={11}>-</td>
                  <td className="p-3 border-r border-cyan-800 text-center text-amber-300">
                    {attendanceLogs.reduce((acc, curr) => {
                      try { 
                        const p = JSON.parse(curr.nil_reason); 
                        const sum = (parseInt(p.specialDuty?.fig) || 0) + 
                                    (parseInt(p.mobileIssue?.fig) || 0) + 
                                    (parseInt(p.loginAppIssue?.fig) || 0) + 
                                    (parseInt(p.withoutReason?.fig) || 0) + 
                                    (parseInt(p.anyOther?.fig) || 0);
                        return acc + sum; 
                      } catch(e) { return acc; }
                    }, 0)}
                  </td>
                  <td className="p-3 text-center text-emerald-300">
                    {attendanceLogs.reduce((acc, curr) => {
                      try { 
                        const p = JSON.parse(curr.nil_reason); 
                        const tot = parseInt(p.totalPosted) || 0;
                        const rest = parseInt(p.restLeave) || 0;
                        const abs = parseInt(p.absent) || 0;
                        const sd = parseInt(p.specialDuty?.fig) || 0;
                        const mob = parseInt(p.mobileIssue?.fig) || 0;
                        const log = parseInt(p.loginAppIssue?.fig) || 0;
                        const w = parseInt(p.withoutReason?.fig) || 0;
                        const any = parseInt(p.anyOther?.fig) || 0;
                        const nil = sd + mob + log + w + any;
                        return acc + Math.max(0, tot - (rest + abs + nil)); 
                      } catch(e) { return acc; }
                    }, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </main>

      {/* 3. PROFESSIONAL FOOTER WITH DEVELOPER CREDITS */}
      <footer className="bg-slate-950 border-t border-slate-800 py-10 px-6 mt-16 text-slate-300">
        <div className="max-w-[98%] mx-auto flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 px-8 py-5 rounded-3xl shadow-2xl w-full max-w-2xl">
            <p className="text-sm md:text-base font-medium text-slate-300">
              Designed and developed by <span className="text-cyan-400 font-bold tracking-wide">Traffic Warden Muhammad Afzal Bhatti</span>
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Full Stack Developer / Mobile App Developer
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
              <span className="text-slate-400">For Assistance please contact on WhatsApp:</span>
              <span className="text-cyan-300 font-mono font-bold tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                0333-4080780 &nbsp;|&nbsp; 0321-7310009
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            © 2026 City Traffic Police Lahore (CTPL). All rights reserved.
          </p>
        </div>
      </footer>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

    </div>
  );
}