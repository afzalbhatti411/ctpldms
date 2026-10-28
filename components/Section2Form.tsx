'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

const FULL_SECTORS_LIST = [
  // --- CITY ZONE ---
  { sr: 1, sector: 'Railway station', zone: 'City Zone', division: 'City', circle: 'City' },
  { sr: 2, sector: 'KOTWALI', zone: 'City Zone', division: 'City', circle: 'City' },
  { sr: 3, sector: 'MISRI SHAH', zone: 'City Zone', division: 'City', circle: 'City' },
  { sr: 4, sector: 'Saggian', zone: 'City Zone', division: 'City', circle: 'Saggian' },
  { sr: 5, sector: 'Band Road', zone: 'City Zone', division: 'City', circle: 'Saggian' },
  { sr: 6, sector: 'Ravi Road', zone: 'City Zone', division: 'City', circle: 'Shahdara' },
  { sr: 7, sector: 'Lari Ada', zone: 'City Zone', division: 'City', circle: 'Shahdara' },
  { sr: 8, sector: 'Shahdara', zone: 'City Zone', division: 'City', circle: 'Shahdara' },
  
  // Division: Civil Line
  { sr: 9, sector: 'Garhi Shahu', zone: 'City Zone', division: 'Civil Line', circle: 'Civil Line' },
  { sr: 10, sector: 'Mackleod Road', zone: 'City Zone', division: 'Civil Line', circle: 'Civil Line' },
  { sr: 11, sector: 'Shalimar', zone: 'City Zone', division: 'Civil Line', circle: 'Manawan' },
  { sr: 12, sector: 'Mughalpura', zone: 'City Zone', division: 'Civil Line', circle: 'Manawan' },
  { sr: 13, sector: 'Wagha', zone: 'City Zone', division: 'Civil Line', circle: 'Manawan' },
  { sr: 14, sector: 'Lower Mall', zone: 'City Zone', division: 'Civil Line', circle: 'Anarkali' },
  { sr: 15, sector: 'Anarkali', zone: 'City Zone', division: 'Civil Line', circle: 'Anarkali' },
  { sr: 16, sector: 'Mall-III', zone: 'City Zone', division: 'Civil Line', circle: 'Anarkali' },
  
  // Division: Allama Iqbal Town
  { sr: 17, sector: 'Ichra', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Ichra' },
  { sr: 18, sector: 'Mozang', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Ichra' },
  { sr: 19, sector: 'Wahdat Road', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Nawankot' },
  { sr: 20, sector: 'Nawankot', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Nawankot' },
  { sr: 21, sector: 'Multan Road', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Nawankot' },
  { sr: 22, sector: 'Sherakot', zone: 'City Zone', division: 'Allama Iqbal Town', circle: 'Nawankot' },

  // --- SADDAR ZONE ---
  { sr: 23, sector: 'Mall-I', zone: 'Saddar Zone', division: 'Cantt', circle: 'Cantt' },
  { sr: 24, sector: 'Mall-II', zone: 'Saddar Zone', division: 'Cantt', circle: 'Cantt' },
  { sr: 25, sector: 'Cantt', zone: 'Saddar Zone', division: 'Cantt', circle: 'Cantt' },
  { sr: 26, sector: 'Defence-B', zone: 'Saddar Zone', division: 'Cantt', circle: 'Defence Raya' },
  { sr: 27, sector: 'Bedian', zone: 'Saddar Zone', division: 'Cantt', circle: 'Defence Raya' },
  { sr: 28, sector: 'Defence-A', zone: 'Saddar Zone', division: 'Cantt', circle: 'Airport' },
  { sr: 29, sector: 'Old Airport', zone: 'Saddar Zone', division: 'Cantt', circle: 'Airport' },
  { sr: 30, sector: 'Walton', zone: 'Saddar Zone', division: 'Cantt', circle: 'Airport' },
  { sr: 31, sector: 'New Airport', zone: 'Saddar Zone', division: 'Cantt', circle: 'Airport' },
  
  // Division: Model Town
  { sr: 32, sector: 'Model Town', zone: 'Saddar Zone', division: 'Model Town', circle: 'Model Town' },
  { sr: 33, sector: 'Kot Lakhpat', zone: 'Saddar Zone', division: 'Model Town', circle: 'Model Town' },
  { sr: 34, sector: 'Kahna', zone: 'Saddar Zone', division: 'Model Town', circle: 'Model Town' },
  { sr: 35, sector: 'gulberg', zone: 'Saddar Zone', division: 'Model Town', circle: 'Gulberg' },
  { sr: 36, sector: 'Main Market', zone: 'Saddar Zone', division: 'Model Town', circle: 'Gulberg' },
  { sr: 37, sector: 'Shadman', zone: 'Saddar Zone', division: 'Model Town', circle: 'Gulberg' },
  
  // Division: Saddar
  { sr: 38, sector: 'Township', zone: 'Saddar Zone', division: 'Saddar', circle: 'Township' },
  { sr: 39, sector: 'Green Town', zone: 'Saddar Zone', division: 'Saddar', circle: 'Township' },
  { sr: 40, sector: 'Raiwind', zone: 'Saddar Zone', division: 'Saddar', circle: 'Saddar' },
  { sr: 41, sector: 'Bhobatiyan', zone: 'Saddar Zone', division: 'Saddar', circle: 'Saddar' },
  { sr: 42, sector: 'Kheya Bane Jinnah', zone: 'Saddar Zone', division: 'Saddar', circle: 'Saddar' },
  { sr: 43, sector: 'Johar Town', zone: 'Saddar Zone', division: 'Saddar', circle: 'Johar Town' },
  { sr: 44, sector: 'Niaz Baig', zone: 'Saddar Zone', division: 'Saddar', circle: 'Johar Town' },
  { sr: 45, sector: 'Manga Mandi', zone: 'Saddar Zone', division: 'Saddar', circle: 'Johar Town' }
];

export default function Section2Form() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSectorLocked, setIsSectorLocked] = useState(false);

  const [entryDate, setEntryDate] = useState('');
  const [selectedSectorName, setSelectedSectorName] = useState('');

  useEffect(() => {
    const initForm = async () => {
      const today = new Date().toISOString().split('T')[0];
      setEntryDate(today);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, jurisdiction')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.role === 'sector_officer') {
          setIsSectorLocked(true);
          const matched = FULL_SECTORS_LIST.find(
            s => s.sector.toLowerCase() === profile.jurisdiction.toLowerCase()
          );
          if (matched) {
            setSelectedSectorName(matched.sector);
          } else {
            setSelectedSectorName(profile.jurisdiction);
          }
        }
      }
    };

    initForm();
  }, []);

  const selectedSectorObj = FULL_SECTORS_LIST.find(s => s.sector.toLowerCase() === selectedSectorName.toLowerCase());
  
  const [totalPosted, setTotalPosted] = useState('');
  const [restLeave, setRestLeave] = useState('');
  const [absent, setAbsent] = useState('');

  const [specialDutyFig, setSpecialDutyFig] = useState('');
  const [specialDutyDetails, setSpecialDutyDetails] = useState('');

  const [mobileIssueFig, setMobileIssueFig] = useState('');
  const [mobileIssueDetails, setMobileIssueDetails] = useState('');

  const [loginAppIssueFig, setLoginAppIssueFig] = useState('');
  const [loginAppIssueDetails, setLoginAppIssueDetails] = useState('');

  const [withoutReasonFig, setWithoutReasonFig] = useState('');
  const [withoutReasonDetails, setWithoutReasonDetails] = useState('');

  const [anyOtherFig, setAnyOtherFig] = useState('');
  const [anyOtherDetails, setAnyOtherDetails] = useState('');
  const [anyOtherReasonText, setAnyOtherReasonText] = useState('');

  const nilTotal = (parseInt(specialDutyFig) || 0) + 
                   (parseInt(mobileIssueFig) || 0) + 
                   (parseInt(loginAppIssueFig) || 0) + 
                   (parseInt(withoutReasonFig) || 0) + 
                   (parseInt(anyOtherFig) || 0);

  const activeOfficers = Math.max(0, (parseInt(totalPosted) || 0) - ((parseInt(restLeave) || 0) + (parseInt(absent) || 0) + nilTotal));

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSectorName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!selectedSectorObj) {
      setErrorMsg('Please select a valid sector.');
      setLoading(false);
      return;
    }

    const nilReasonPayload = {
      totalPosted,
      restLeave,
      absent,
      specialDuty: { fig: specialDutyFig, details: specialDutyDetails },
      mobileIssue: { fig: mobileIssueFig, details: mobileIssueDetails },
      loginAppIssue: { fig: loginAppIssueFig, details: loginAppIssueDetails },
      withoutReason: { fig: withoutReasonFig, details: withoutReasonDetails },
      anyOther: { fig: anyOtherFig, details: anyOtherDetails, reason: anyOtherReasonText },
      activeOfficers: activeOfficers.toString()
    };

    const isNil = nilTotal > 0 ? 'Nil Diary' : 'Active';

    try {
      const { error } = await supabase.from('section2_attendance_logs').insert([
        {
          entry_date: entryDate,
          zone: selectedSectorObj.zone,
          division: selectedSectorObj.division,
          circle: selectedSectorObj.circle,
          sector: selectedSectorObj.sector,
          total_strength: parseInt(totalPosted) || 0,
          present_strength: activeOfficers,
          diary_status: isNil,
          nil_reason: JSON.stringify(nilReasonPayload)
        }
      ]);

      if (error) throw error;
      
      alert('Attendance and Nil Diary successfully submitted!');
      router.push('/sector-dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit attendance log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-extrabold text-blue-900">Section-2: Digital Challan Diary</h1>
        <p className="text-sm text-gray-500">Official 45-Sector Attendance & Nil Diary Entry Wizard</p>
        <div className="flex gap-2 mt-4">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Step 1: Date & Sector Identification</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
              <input 
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full p-3 border rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Sector Name {isSectorLocked && <span className="text-blue-600 font-bold">(Locked to your jurisdiction)</span>}
              </label>
              <select
                value={selectedSectorName}
                onChange={handleSectorChange}
                disabled={isSectorLocked}
                className={`w-full p-3 border rounded-xl text-sm ${isSectorLocked ? 'bg-gray-100 font-bold text-gray-900 cursor-not-allowed select-none' : 'bg-white'}`}
                required
              >
                <option value="">-- Select Official Sector --</option>
                {FULL_SECTORS_LIST.map((s) => (
                  <option key={s.sr} value={s.sector}>
                    {s.sr}. {s.sector}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Locked Zone</label>
                <input 
                  type="text" 
                  value={selectedSectorObj ? selectedSectorObj.zone : ''} 
                  disabled 
                  placeholder="Auto-selected" 
                  className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Locked Division</label>
                <input 
                  type="text" 
                  value={selectedSectorObj ? selectedSectorObj.division : ''} 
                  disabled 
                  placeholder="Auto-selected" 
                  className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Locked Circle</label>
                <input 
                  type="text" 
                  value={selectedSectorObj ? selectedSectorObj.circle : ''} 
                  disabled 
                  placeholder="Auto-selected" 
                  className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!selectedSectorName) {
                    setErrorMsg('Please select a sector.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(2);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow transition"
              >
                Next: Manpower Status &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Step 2: Manpower & Attendance Status</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Total No. of Challaning Officers Posted in Sectors (Without D.O & Lifter Incharges)
              </label>
              <input 
                type="number"
                value={totalPosted}
                onChange={(e) => setTotalPosted(e.target.value)}
                className="w-full p-3 border rounded-xl text-sm"
                placeholder="e.g. 10"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Total On Rest / Medical / Leave etc.</label>
              <input 
                type="number"
                value={restLeave}
                onChange={(e) => setRestLeave(e.target.value)}
                className="w-full p-3 border rounded-xl text-sm"
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Total Absent</label>
              <input 
                type="number"
                value={absent}
                onChange={(e) => setAbsent(e.target.value)}
                className="w-full p-3 border rounded-xl text-sm"
                placeholder="e.g. 0"
              />
            </div>
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow transition"
              >
                Next: Nil Diary Breakdown &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Step 3: Nil Diary Reasons & Active Officers</h2>
            
            <div className="p-3 bg-gray-50 border rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-700">1. Special Duty / Attachment</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Figure" value={specialDutyFig} onChange={(e) => setSpecialDutyFig(e.target.value)} className="p-2 border rounded-lg text-xs" />
                <input type="text" placeholder="Name & Belt No." value={specialDutyDetails} onChange={(e) => setSpecialDutyDetails(e.target.value)} className="p-2 border rounded-lg text-xs" />
              </div>
            </div>

            <div className="p-3 bg-gray-50 border rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-700">2. Mobile Issue</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Figure" value={mobileIssueFig} onChange={(e) => setMobileIssueFig(e.target.value)} className="p-2 border rounded-lg text-xs" />
                <input type="text" placeholder="Name & Belt No." value={mobileIssueDetails} onChange={(e) => setMobileIssueDetails(e.target.value)} className="p-2 border rounded-lg text-xs" />
              </div>
            </div>

            <div className="p-3 bg-gray-50 border rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-700">3. Login / App Issue</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Figure" value={loginAppIssueFig} onChange={(e) => setLoginAppIssueFig(e.target.value)} className="p-2 border rounded-lg text-xs" />
                <input type="text" placeholder="Name & Belt No." value={loginAppIssueDetails} onChange={(e) => setLoginAppIssueDetails(e.target.value)} className="p-2 border rounded-lg text-xs" />
              </div>
            </div>

            <div className="p-3 bg-gray-50 border rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-700">4. Without Reason</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Figure" value={withoutReasonFig} onChange={(e) => setWithoutReasonFig(e.target.value)} className="p-2 border rounded-lg text-xs" />
                <input type="text" placeholder="Name & Belt No." value={withoutReasonDetails} onChange={(e) => setWithoutReasonDetails(e.target.value)} className="p-2 border rounded-lg text-xs" />
              </div>
            </div>

            <div className="p-3 bg-gray-50 border rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-700">5. Any Other Reason</label>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Figure" value={anyOtherFig} onChange={(e) => setAnyOtherFig(e.target.value)} className="p-2 border rounded-lg text-xs" />
                <input type="text" placeholder="Name & Belt No." value={anyOtherDetails} onChange={(e) => setAnyOtherDetails(e.target.value)} className="p-2 border rounded-lg text-xs" />
                <input type="text" placeholder="Reason Specification" value={anyOtherReasonText} onChange={(e) => setAnyOtherReasonText(e.target.value)} className="p-2 border rounded-lg text-xs" />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase">Auto-Calculated Active Officers</span>
                <p className="text-[11px] text-blue-600">Total Posted - (Rest/Leave + Absent + Nil Diary Total)</p>
              </div>
              <span className="text-2xl font-black text-blue-700 font-mono">{activeOfficers}</span>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-xl text-sm shadow transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Attendance & Diary Record'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}