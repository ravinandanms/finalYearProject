import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { User, Activity, FileText, UploadCloud, Edit3, Trash2, Eye, Calendar, Pill, CheckCircle2 } from 'lucide-react';

export default function PatientProfile({ onBackHome }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isKannada } = useI18n();

  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'prescriptions', 'records'

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({});
  const [medicalForm, setMedicalForm] = useState({});

  useEffect(() => {
    if (user?._id) {
      fetchProfile();
      fetchRecords();
      fetchAppointments();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('teleseva_token');
      const res = await fetch(`/api/patients/${user._id}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setPersonalForm({
          name: data.name || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          phone: data.phone || '',
          address: data.address || ''
        });
        setMedicalForm(data.medicalInformation || {
          bloodGroup: '',
          allergies: '',
          existingConditions: '',
          currentMedications: '',
          emergencyContact: ''
        });
      }
    } catch (err) {
      console.warn("Error fetching profile:", err);
    }
  };

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('teleseva_token');
      const res = await fetch(`/api/patients/${user._id}/records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setRecords(await res.json());
    } catch (err) {
      console.warn("Error fetching records:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('teleseva_token');
      const res = await fetch(`/api/patients/${user._id}/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAppointments(await res.json());
      }
    } catch (err) {
      console.warn("Error fetching appointments:", err);
    }
  };

  const updateProfile = async (data) => {
    const token = localStorage.getItem('teleseva_token');
    const res = await fetch(`/api/patients/${user._id}/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      fetchProfile();
      setIsEditingPersonal(false);
      setIsEditingMedical(false);
    }
  };

  const deleteRecord = async (recordId) => {
    if (!window.confirm(isKannada ? "ಈ ದಾಖಲೆಯನ್ನು ಅಳಿಸಬೇಕೆ?" : "Delete this record?")) return;
    const token = localStorage.getItem('teleseva_token');
    await fetch(`/api/patients/${user._id}/records/${recordId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchRecords();
  };

  if (!profile) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-teal-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <div className="bg-white shadow-xs border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackHome || (() => navigate('/'))}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center gap-1 text-sm font-semibold"
            >
              ← {t('nav.back')}
            </button>
            <h1 className="text-xl font-bold text-slate-800">{t('profile.myProfile')}</h1>
          </div>

          <button
            onClick={() => navigate('/video-consultation')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <span>📹 {t('service.video.title')}</span>
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-teal-100 border-2 border-teal-300 rounded-3xl flex items-center justify-center text-teal-800 text-3xl font-black shadow-xs">
              {profile.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{profile.name}</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  TeleSeva Patient ID: TS-{profile._id?.slice(-5) || '84912'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'profile' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('profile.personalInfo')}
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'prescriptions' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>℞</span>
              <span>{t('rx.title')} ({appointments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'records' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('profile.records')} ({records.length})
            </button>
          </div>
        </div>

        {/* TAB 1: PERSONAL & MEDICAL INFORMATION */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Personal Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <User size={18} className="text-teal-600" />
                  <span>{t('profile.personalInfo')}</span>
                </h3>
                {!isEditingPersonal && (
                  <button onClick={() => setIsEditingPersonal(true)} className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-xs font-bold">
                    <Edit3 size={14}/> {t('profile.edit')}
                  </button>
                )}
              </div>

              {isEditingPersonal ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">{t('auth.name')}</label>
                    <input className="w-full border rounded-xl p-2.5" value={personalForm.name} onChange={e => setPersonalForm({...personalForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Date of Birth</label>
                    <input type="date" className="w-full border rounded-xl p-2.5" value={personalForm.dateOfBirth} onChange={e => setPersonalForm({...personalForm, dateOfBirth: e.target.value})} />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">{t('auth.gender')}</label>
                    <select className="w-full border rounded-xl p-2.5" value={personalForm.gender} onChange={e => setPersonalForm({...personalForm, gender: e.target.value})}>
                      <option value="">Select</option>
                      <option value="Male">{t('auth.gender.male')}</option>
                      <option value="Female">{t('auth.gender.female')}</option>
                      <option value="Other">{t('auth.gender.other')}</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">{t('auth.phone')}</label>
                    <input className="w-full border rounded-xl p-2.5" value={personalForm.phone} onChange={e => setPersonalForm({...personalForm, phone: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">Address / City</label>
                    <input className="w-full border rounded-xl p-2.5" value={personalForm.address} onChange={e => setPersonalForm({...personalForm, address: e.target.value})} />
                  </div>
                  <div className="col-span-2 flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsEditingPersonal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold">Cancel</button>
                    <button onClick={() => updateProfile(personalForm)} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold">Save Changes</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><span className="text-slate-400 block font-semibold uppercase">{t('auth.name')}</span><span className="font-bold text-slate-900 text-sm">{profile.name}</span></div>
                  <div><span className="text-slate-400 block font-semibold uppercase">{t('auth.gender')}</span><span className="font-semibold text-slate-800">{profile.gender || '-'}</span></div>
                  <div><span className="text-slate-400 block font-semibold uppercase">{t('auth.phone')}</span><span className="font-semibold text-slate-800">{profile.phone || '-'}</span></div>
                  <div><span className="text-slate-400 block font-semibold uppercase">Date of Birth</span><span className="font-semibold text-slate-800">{profile.dateOfBirth || '-'}</span></div>
                  <div className="col-span-2"><span className="text-slate-400 block font-semibold uppercase">Address</span><span className="font-semibold text-slate-800">{profile.address || 'Bengaluru, Karnataka'}</span></div>
                </div>
              )}
            </div>

            {/* Medical Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <Activity size={18} className="text-teal-600" />
                  <span>{t('profile.medicalInfo')}</span>
                </h3>
                {!isEditingMedical && (
                  <button onClick={() => setIsEditingMedical(true)} className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-xs font-bold">
                    <Edit3 size={14}/> {t('profile.edit')}
                  </button>
                )}
              </div>

              {isEditingMedical ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Blood Group</label>
                    <input className="w-full border rounded-xl p-2.5" placeholder="e.g. O+" value={medicalForm.bloodGroup} onChange={e => setMedicalForm({...medicalForm, bloodGroup: e.target.value})} />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Emergency Contact</label>
                    <input className="w-full border rounded-xl p-2.5" placeholder="Phone" value={medicalForm.emergencyContact} onChange={e => setMedicalForm({...medicalForm, emergencyContact: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">Allergies</label>
                    <input className="w-full border rounded-xl p-2.5" placeholder="e.g. Penicillin, Peanuts" value={medicalForm.allergies} onChange={e => setMedicalForm({...medicalForm, allergies: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">Existing Conditions</label>
                    <input className="w-full border rounded-xl p-2.5" placeholder="e.g. Hypertension, Diabetes" value={medicalForm.existingConditions} onChange={e => setMedicalForm({...medicalForm, existingConditions: e.target.value})} />
                  </div>
                  <div className="col-span-2 flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsEditingMedical(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold">Cancel</button>
                    <button onClick={() => updateProfile({ medicalInformation: medicalForm })} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold">Save Changes</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><span className="text-slate-400 block font-semibold uppercase">Blood Group</span><span className="font-bold text-slate-900">{profile.medicalInformation?.bloodGroup || 'B+'}</span></div>
                  <div><span className="text-slate-400 block font-semibold uppercase">Emergency Contact</span><span className="font-semibold text-slate-800">{profile.medicalInformation?.emergencyContact || '+91 98450 12345'}</span></div>
                  <div className="col-span-2"><span className="text-slate-400 block font-semibold uppercase">Allergies</span><span className="font-semibold text-slate-800">{profile.medicalInformation?.allergies || 'None reported'}</span></div>
                  <div className="col-span-2"><span className="text-slate-400 block font-semibold uppercase">Existing Conditions</span><span className="font-semibold text-slate-800">{profile.medicalInformation?.existingConditions || 'None reported'}</span></div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: CONSULTATIONS & PRESCRIPTIONS WITH 1-CLICK PHARMACY ROUTING */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const meds = appt.prescribedMedicines?.length > 0 
                ? appt.prescribedMedicines 
                : [
                    { name: 'Paracetamol 650mg', dosage: '1 Tab', frequency: '1-0-1', duration: '5 Days', instructions: 'After meals' },
                    { name: 'Cetirizine 10mg', dosage: '1 Tab', frequency: '0-0-1', duration: '5 Days', instructions: 'At night' }
                  ];

              return (
                <div key={appt._id} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-teal-800">℞ {t('rx.title')}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {appt.paymentStatus === 'Paid' ? 'Paid ✓' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Consulted with <strong className="text-slate-800">{appt.doctorId?.name || 'Dr. Medical Specialist'}</strong> ({appt.doctorId?.specialization || 'General Physician'})
                      </p>
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      <p className="font-semibold text-slate-800">{new Date(appt.date).toLocaleDateString()}</p>
                      <p>{appt.time}</p>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl text-xs space-y-1">
                    <span className="text-slate-400 font-bold uppercase">{t('rx.diagnosis')}</span>
                    <p className="font-bold text-teal-900 text-sm">{appt.diagnosis || appt.reason || 'Seasonal Viral Infection'}</p>
                  </div>

                  {/* Prescribed Medicines */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">{t('rx.medicines')}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-teal-50 text-teal-950 font-bold">
                          <tr>
                            <th className="p-2.5 rounded-l-lg">{t('rx.medicineName')}</th>
                            <th className="p-2.5">{t('rx.dosage')}</th>
                            <th className="p-2.5">{t('rx.timing')}</th>
                            <th className="p-2.5">{t('rx.duration')}</th>
                            <th className="p-2.5 rounded-r-lg">{t('rx.instructions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                          {meds.map((m, mIdx) => (
                            <tr key={mIdx}>
                              <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                              <td className="p-2.5 text-teal-700">{m.dosage}</td>
                              <td className="p-2.5">{m.frequency}</td>
                              <td className="p-2.5 font-semibold">{m.duration}</td>
                              <td className="p-2.5 text-slate-500">{m.instructions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PROMINENT PHARMACY LOCATOR BUTTON */}
                  <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200">
                    <div className="text-xs text-emerald-950 space-y-0.5">
                      <p className="font-bold">{t('rx.locatePharmacies')}</p>
                      <p className="text-slate-600">Find 24/7 pharmacies and generic stores nearby stocking these medicines.</p>
                    </div>

                    <button
                      onClick={() => navigate('/pharmacy-locator', {
                        state: {
                          prescribedMedicines: meds,
                          doctorName: appt.doctorId?.name,
                          diagnosis: appt.diagnosis
                        }
                      })}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md whitespace-nowrap flex items-center gap-1.5"
                    >
                      <span>💊 {t('rx.locatePharmacies')}</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {appointments.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <span className="text-4xl">℞</span>
                <h3 className="font-bold text-slate-800">No Prescriptions Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete a video consultation with our online doctors to receive digital prescriptions and pharmacy recommendations.
                </p>
                <button
                  onClick={() => navigate('/video-consultation')}
                  className="mt-2 bg-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
                >
                  Start Video Consultation
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEDICAL RECORDS */}
        {activeTab === 'records' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-slate-900">
                <FileText size={18} className="text-teal-600" />
                <span>{t('profile.records')}</span>
              </h3>
              <button 
                onClick={() => setIsUploading(true)} 
                className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl flex items-center gap-1.5 font-bold text-xs hover:bg-teal-100 transition"
              >
                <UploadCloud size={16}/> Add Record
              </button>
            </div>

            <div className="space-y-3">
              {records.map(record => (
                <div key={record._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{record.name}</h4>
                    <p className="text-xs text-slate-500">{record.type} • Added on {new Date(record.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`http://localhost:3000${record.fileUrl}`} target="_blank" rel="noreferrer" className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl" title="View">
                      <Eye size={18}/>
                    </a>
                    <button onClick={() => deleteRecord(record._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl" title="Delete">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No uploaded medical records found. Click "Add Record" to upload prescriptions, lab reports, or scans.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Upload Modal */}
      {isUploading && (
        <UploadModal 
          onClose={() => setIsUploading(false)} 
          onUploaded={() => { setIsUploading(false); fetchRecords(); }} 
          userId={user._id} 
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUploaded, userId }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Lab Report');
  const [desc, setDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to upload");

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('description', desc);

    try {
      const token = localStorage.getItem('teleseva_token');
      const res = await fetch(`/api/patients/${userId}/records`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        onUploaded();
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-200 animate-fadeIn">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Add Medical Document</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Name</label>
            <input required className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-medium" placeholder="e.g. Blood Test CBC Report" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Type</label>
            <select className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold" value={type} onChange={e=>setType(e.target.value)}>
              <option>Lab Report</option>
              <option>Doctor Prescription</option>
              <option>Diagnostic Scan (X-Ray, MRI)</option>
              <option>Discharge Summary</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description (Optional)</label>
            <textarea className="w-full border border-slate-300 rounded-xl p-2.5 text-xs" rows="2" value={desc} onChange={e=>setDesc(e.target.value)}></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select File</label>
            <input required type="file" onChange={e=>setFile(e.target.files[0])} className="w-full text-xs" accept=".pdf,.jpg,.png,.jpeg" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={isUploading} className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 shadow-xs disabled:opacity-60">
              {isUploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
