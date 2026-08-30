import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Activity, FileText, UploadCloud, Edit3, Trash2, Eye } from 'lucide-react';

export default function PatientProfile({ onBackHome }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({});
  const [medicalForm, setMedicalForm] = useState({});

  useEffect(() => {
    fetchProfile();
    fetchRecords();
  }, [user]);

  const fetchProfile = async () => {
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
  };

  const fetchRecords = async () => {
    const token = localStorage.getItem('teleseva_token');
    const res = await fetch(`/api/patients/${user._id}/records`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setRecords(await res.json());
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
    if (!window.confirm("Delete this record?")) return;
    const token = localStorage.getItem('teleseva_token');
    await fetch(`/api/patients/${user._id}/records/${recordId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchRecords();
  };

  if (!profile) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={onBackHome} className="p-2 hover:bg-slate-100 rounded-full">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto w-full p-6 space-y-6">
        
        {/* Header section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{profile.name}</h2>
              <p className="text-slate-500">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800"><User size={20}/> Personal Information</h3>
            {!isEditingPersonal && (
              <button onClick={() => setIsEditingPersonal(true)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
                <Edit3 size={16}/> Edit
              </button>
            )}
          </div>
          {isEditingPersonal ? (
            <div className="grid grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Full Name" value={personalForm.name} onChange={e => setPersonalForm({...personalForm, name: e.target.value})} />
              <input type="date" className="border p-2 rounded" value={personalForm.dateOfBirth} onChange={e => setPersonalForm({...personalForm, dateOfBirth: e.target.value})} />
              <select className="border p-2 rounded" value={personalForm.gender} onChange={e => setPersonalForm({...personalForm, gender: e.target.value})}>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input className="border p-2 rounded" placeholder="Phone" value={personalForm.phone} onChange={e => setPersonalForm({...personalForm, phone: e.target.value})} />
              <input className="border p-2 rounded col-span-2" placeholder="Address" value={personalForm.address} onChange={e => setPersonalForm({...personalForm, address: e.target.value})} />
              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button onClick={() => setIsEditingPersonal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                <button onClick={() => updateProfile(personalForm)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block">Full Name</span><span className="font-medium text-slate-800">{profile.name}</span></div>
              <div><span className="text-slate-500 block">Date of Birth</span><span className="font-medium text-slate-800">{profile.dateOfBirth || '-'}</span></div>
              <div><span className="text-slate-500 block">Gender</span><span className="font-medium text-slate-800">{profile.gender || '-'}</span></div>
              <div><span className="text-slate-500 block">Phone</span><span className="font-medium text-slate-800">{profile.phone || '-'}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block">Address</span><span className="font-medium text-slate-800">{profile.address || '-'}</span></div>
            </div>
          )}
        </div>

        {/* Medical Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800"><Activity size={20}/> Medical Information</h3>
            {!isEditingMedical && (
              <button onClick={() => setIsEditingMedical(true)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
                <Edit3 size={16}/> Edit
              </button>
            )}
          </div>
          {isEditingMedical ? (
            <div className="grid grid-cols-2 gap-4">
              <input className="border p-2 rounded" placeholder="Blood Group" value={medicalForm.bloodGroup} onChange={e => setMedicalForm({...medicalForm, bloodGroup: e.target.value})} />
              <input className="border p-2 rounded" placeholder="Emergency Contact" value={medicalForm.emergencyContact} onChange={e => setMedicalForm({...medicalForm, emergencyContact: e.target.value})} />
              <input className="border p-2 rounded col-span-2" placeholder="Allergies" value={medicalForm.allergies} onChange={e => setMedicalForm({...medicalForm, allergies: e.target.value})} />
              <input className="border p-2 rounded col-span-2" placeholder="Existing Conditions" value={medicalForm.existingConditions} onChange={e => setMedicalForm({...medicalForm, existingConditions: e.target.value})} />
              <input className="border p-2 rounded col-span-2" placeholder="Current Medications" value={medicalForm.currentMedications} onChange={e => setMedicalForm({...medicalForm, currentMedications: e.target.value})} />
              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button onClick={() => setIsEditingMedical(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                <button onClick={() => updateProfile({ medicalInformation: medicalForm })} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block">Blood Group</span><span className="font-medium text-slate-800">{profile.medicalInformation?.bloodGroup || '-'}</span></div>
              <div><span className="text-slate-500 block">Emergency Contact</span><span className="font-medium text-slate-800">{profile.medicalInformation?.emergencyContact || '-'}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block">Allergies</span><span className="font-medium text-slate-800">{profile.medicalInformation?.allergies || '-'}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block">Existing Conditions</span><span className="font-medium text-slate-800">{profile.medicalInformation?.existingConditions || '-'}</span></div>
              <div className="col-span-2"><span className="text-slate-500 block">Current Medications</span><span className="font-medium text-slate-800">{profile.medicalInformation?.currentMedications || '-'}</span></div>
            </div>
          )}
        </div>

        {/* Medical Records */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800"><FileText size={20}/> Medical Records</h3>
            <button onClick={() => setIsUploading(true)} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 font-medium hover:bg-green-100">
              <UploadCloud size={16}/> Add Record
            </button>
          </div>

          <div className="space-y-4">
            {records.map(record => (
              <div key={record._id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50">
                <div>
                  <h4 className="font-semibold text-slate-800">{record.name}</h4>
                  <p className="text-sm text-slate-500">{record.type} • Added by {record.uploadedBy?.name} on {new Date(record.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`http://localhost:3000${record.fileUrl}`} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                    <Eye size={18}/>
                  </a>
                  {record.uploadedBy?._id === profile._id && (
                    <button onClick={() => deleteRecord(record._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                      <Trash2 size={18}/>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {records.length === 0 && (
              <div className="text-center py-8 text-slate-500">No medical records found.</div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {isUploading && <UploadModal onClose={() => setIsUploading(false)} onUploaded={() => { setIsUploading(false); fetchRecords(); }} userId={user._id} />}
    </div>
  );
}

function UploadModal({ onClose, onUploaded, userId }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Lab Report');
  const [desc, setDesc] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('description', desc);

    const token = localStorage.getItem('teleseva_token');
    const res = await fetch(`/api/patients/${userId}/records`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      onUploaded();
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Add Medical Record</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Record Name</label>
            <input required className="w-full border p-2 rounded-lg" placeholder="e.g. Blood Test Report" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Record Type</label>
            <select className="w-full border p-2 rounded-lg" value={type} onChange={e=>setType(e.target.value)}>
              <option>Lab Report</option>
              <option>Prescription</option>
              <option>Scan Report</option>
              <option>Previous Medical Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea className="w-full border p-2 rounded-lg" rows="2" value={desc} onChange={e=>setDesc(e.target.value)}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Upload File</label>
            <input required type="file" onChange={e=>setFile(e.target.files[0])} className="w-full text-sm" accept=".pdf,.jpg,.png,.jpeg" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
}
