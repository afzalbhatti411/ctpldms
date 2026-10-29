'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';

const TRADITIONAL_SECTORS = [
  'BAND ROAD', 'SAGGIAN', 'SHERAKOT', 'Lori Adda', 'Shahdara', 
  'MUGHALPURA', 'WAHGA', 'Niaz Baig', 'Manga Mandi', 
  'Raiwind', 'Bhobatian', 'KAHNA', 'TRU Saggian (SD)'
];

const CIRCLE_TO_TRADITIONAL_SECTORS_MAP: { [key: string]: string[] } = {
  'city': [], // City circle has no traditional commercial vehicle sectors
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

const VEHICLE_CATEGORIES = [
  'Dump', '22 Wheeler / Trailer', 'Truck', 'Bus / Coaster', 'Pick Up', 'Mazda'
];

export default function Section1Form() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allowedSectors, setAllowedSectors] = useState<string[]>([]); // Default empty to prevent flash of all sectors
  const [isSectorLocked, setIsSectorLocked] = useState(false);
  const regInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    entryDate: '',
    sectorName: '',
    vehicleCategory: '',
    companyAddaName: '',
    registrationNo: '',
    driverName: '',
    driverLicenseNo: '',
    driverCnic: '',
    engineChassisVerified: 'YES',
    routePermit: 'YES',
    fitnessCertificate: 'YES',
    backLight: 'YES',
    reflectingTape: 'YES',
    driverBriefed: 'YES',
    actionTaken: 'Challan Issued'
  });

  useEffect(() => {
    const initForm = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, jurisdiction')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.role === 'circle_reader' && profile.jurisdiction) {
          const circleKey = profile.jurisdiction.trim().toLowerCase();
          const mappedTraditional = CIRCLE_TO_TRADITIONAL_SECTORS_MAP[circleKey] || [];
          
          const filtered = TRADITIONAL_SECTORS.filter(sec => 
            mappedTraditional.some(m => m.toLowerCase() === sec.toLowerCase())
          );

          setAllowedSectors(filtered);
          if (filtered.length === 1) {
            setIsSectorLocked(true);
            setFormData(prev => ({ ...prev, entryDate: today, sectorName: filtered[0] }));
          }
        } else {
          // Admins or non-restricted users see all 13 traditional sectors
          setAllowedSectors(TRADITIONAL_SECTORS);
        }
      } else {
        setAllowedSectors(TRADITIONAL_SECTORS);
      }

      setFormData(prev => ({ ...prev, entryDate: today }));
    };

    initForm();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'registrationNo' && regInputRef.current) {
      regInputRef.current.setCustomValidity('');
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5 && value.length <= 12) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      value = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12, 13)}`;
    }
    setFormData(prev => ({ ...prev, driverCnic: value }));
  };

  const handleRegistrationInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const val = input.value;
    const hasLetters = /[A-Za-z]/.test(val);
    const hasDigits = /[0-9]/.test(val);

    if (val && (!hasLetters || !hasDigits)) {
      input.setCustomValidity('Registration No. must include both English letters and digits (e.g. LHE-123).');
    } else {
      input.setCustomValidity('');
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.entryDate || !formData.sectorName || !formData.vehicleCategory || !formData.registrationNo) {
        return;
      }
      
      const hasLetters = /[A-Za-z]/.test(formData.registrationNo);
      const hasDigits = /[0-9]/.test(formData.registrationNo);
      if (!hasLetters || !hasDigits) {
        if (regInputRef.current) {
          regInputRef.current.setCustomValidity('Registration No. must include both English letters and digits (e.g. LHE-123).');
          regInputRef.current.reportValidity();
        }
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.driverName || !formData.driverLicenseNo || !formData.driverCnic) {
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('section1_vehicle_logs').insert([
        {
          entry_date: formData.entryDate,
          sector_name: formData.sectorName,
          vehicle_category: formData.vehicleCategory,
          company_adda_name: formData.companyAddaName.trim() ? formData.companyAddaName : '-',
          registration_no: formData.registrationNo.toUpperCase(),
          driver_name: formData.driverName,
          driver_license_no: formData.driverLicenseNo,
          driver_cnic: formData.driverCnic,
          engine_chassis_verified: formData.engineChassisVerified,
          route_permit: formData.routePermit,
          fitness_certificate: formData.fitnessCertificate,
          back_light: formData.backLight,
          reflecting_tape: formData.reflectingTape,
          driver_uniform_briefed: formData.driverBriefed,
          action_taken: formData.actionTaken
        }
      ]);

      if (error) throw error;

      alert('HTV/LTV Commercial Vehicle Log successfully saved to Supabase!');

      setFormData(prev => ({
        ...prev,
        vehicleCategory: '',
        companyAddaName: '',
        registrationNo: '',
        driverName: '',
        driverLicenseNo: '',
        driverCnic: '',
        engineChassisVerified: 'YES',
        routePermit: 'YES',
        fitnessCertificate: 'YES',
        backLight: 'YES',
        reflectingTape: 'YES',
        driverBriefed: 'YES',
        actionTaken: 'Challan Issued'
      }));
      setCurrentStep(1);
    } catch (err: any) {
      console.error('Error saving to Supabase:', err.message);
      alert(`Failed to save log: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 mt-6">
      <div className="border-b pb-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">HTV/LTV Commercial Vehicle Logs - Section-1</h2>
          <p className="text-sm text-gray-500 mt-1">City Traffic Police Lahore - Authorized Jurisdiction</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm">
          Step {currentStep} of 3
        </div>
      </div>

      <div className="mb-8 flex gap-2">
        <div className={`h-2 flex-1 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`h-2 flex-1 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`h-2 flex-1 rounded-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
      </div>

      {allowedSectors.length === 0 ? (
        <div className="p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-medium text-center space-y-2">
          <p className="font-bold text-base">No Traditional Sectors Under Your Jurisdiction</p>
          <p>Your assigned circle does not have any of the 13 traditional commercial vehicle sectors assigned for Section-1 reporting. Selection is disabled.</p>
        </div>
      ) : (
        /* STEP 1 */
        currentStep === 1 && (
          <form onSubmit={handleNext} className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">Step 1: Vehicle Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input 
                  type="date" 
                  name="entryDate"
                  value={formData.entryDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Traditional Sector Name {isSectorLocked && <span className="text-xs text-blue-600 font-bold">(Locked to your jurisdiction)</span>}
                </label>
                <select 
                  name="sectorName"
                  value={formData.sectorName}
                  onChange={handleChange}
                  disabled={isSectorLocked}
                  className={`w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm outline-none transition ${isSectorLocked ? 'bg-gray-100 font-bold cursor-not-allowed select-none' : 'bg-white'}`}
                  required
                >
                  <option value="">-- Select Sector --</option>
                  {allowedSectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Category</label>
                <select 
                  name="vehicleCategory"
                  value={formData.vehicleCategory}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  required
                >
                  <option value="">-- Select Category --</option>
                  {VEHICLE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company / Adda Name <span className="text-xs font-normal text-gray-400">(Optional)</span>
                </label>
                <input 
                  type="text" 
                  name="companyAddaName"
                  value={formData.companyAddaName}
                  onChange={handleChange}
                  placeholder="e.g. National Logistics Cell"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Registration No. <span className="text-xs font-normal text-gray-500">(Must include English words + digits, e.g. LHE-123)</span>
                </label>
                <input 
                  ref={regInputRef}
                  type="text" 
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleChange}
                  onInput={handleRegistrationInput}
                  placeholder="e.g. LHE-123"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition uppercase"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button 
                type="submit"
                className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Next: Driver & Legal Particulars &rarr;
              </button>
            </div>
          </form>
        )
      )}

      {/* STEP 2 */}
      {allowedSectors.length > 0 && currentStep === 2 && (
        <form onSubmit={handleNext} className="space-y-6">
          <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">Step 2: Driver & Legal Particulars</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Driver Name</label>
              <input 
                type="text" 
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                placeholder="Enter driver full name"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">License No.</label>
              <input 
                type="text" 
                name="driverLicenseNo"
                value={formData.driverLicenseNo}
                onChange={handleChange}
                placeholder="Enter license number"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CNIC No. (13 Digits)</label>
              <input 
                type="text" 
                name="driverCnic"
                value={formData.driverCnic}
                onChange={handleCnicChange}
                placeholder="35202-1234567-1"
                maxLength={15}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Engine & Chassis No. Verified</label>
              <select 
                name="engineChassisVerified"
                value={formData.engineChassisVerified}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Route Permit</label>
              <select 
                name="routePermit"
                value={formData.routePermit}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fitness Certificate</label>
              <select 
                name="fitnessCertificate"
                value={formData.fitnessCertificate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button 
              type="button"
              onClick={handlePrev}
              className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
            >
              &larr; Back
            </button>
            <button 
              type="submit"
              className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Next: Safety Audit &rarr;
            </button>
          </div>
        </form>
      )}

      {/* STEP 3 */}
      {allowedSectors.length > 0 && currentStep === 3 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">Step 3: Safety Audit & Enforcement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Back Light Working</label>
              <select 
                name="backLight"
                value={formData.backLight}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reflecting Tape Installed</label>
              <select 
                name="reflectingTape"
                value={formData.reflectingTape}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Driver Briefed</label>
              <select 
                name="driverBriefed"
                value={formData.driverBriefed}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Action Taken Against HTV/LTV</label>
              <select 
                name="actionTaken"
                value={formData.actionTaken}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="Challan Issued">Challan Issued</option>
                <option value="Challan Not Issued">Challan Not Issued</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button 
              type="button"
              onClick={handlePrev}
              className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
            >
              &larr; Back
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Submitting to DB...' : 'Submit Complete Vehicle Log'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}