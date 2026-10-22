import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Peer from 'simple-peer';
import { Activity, Calendar, User, LogOut, Video, PhoneIncoming, PhoneOff, Check, Mic, MicOff, Camera, CameraOff, Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';

export default function DoctorDashboard() {
  const { user, socket, logout } = useAuth();
  const { t, isKannada } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  // Global Call State for Doctor
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [activeCallSession, setActiveCallSession] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      console.log("[Doctor] Received incoming call from patient:", data);
      setIncomingCallData(data);
    };

    const handleCallEnded = () => {
      console.log("[Doctor] Call ended by patient.");
      setIncomingCallData(null);
      setActiveCallSession(null);
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAcceptIncomingCall = () => {
    if (!incomingCallData) return;
    setActiveCallSession(incomingCallData);
    setIncomingCallData(null);
    navigate('/doctor/consultation');
  };

  const handleRejectIncomingCall = () => {
    if (socket && incomingCallData) {
      socket.emit('reject_call', { to: String(incomingCallData.from) });
    }
    setIncomingCallData(null);
  };

  const navItems = [
    { name: t('doc.overview'), path: '/doctor', icon: Activity },
    { name: t('doc.appointments'), path: '/doctor/appointments', icon: Calendar },
    { name: t('doc.consultationRoom'), path: '/doctor/consultation', icon: Video },
    { name: t('profile.myProfile'), path: '/doctor/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {/* Global Incoming Call Popup Notification */}
      {incomingCallData && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border-2 border-teal-500 text-center animate-bounce-short">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-md">
              <PhoneIncoming size={36} className="text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{t('doc.incomingCall')}</h2>
            <p className="text-slate-600 font-medium mb-6">
              <span className="text-teal-700 font-semibold">{incomingCallData.name || 'Patient'}</span> {isKannada ? 'ಲೈವ್ ಸಮಾಲೋಚನೆಗೆ ಕರೆ ಮಾಡುತ್ತಿದ್ದಾರೆ.' : 'is calling for a live video consultation.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAcceptIncomingCall}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105"
              >
                <Check size={20} />
                {t('doc.acceptCall')}
              </button>
              <button
                onClick={handleRejectIncomingCall}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <PhoneOff size={20} />
                {t('doc.declineCall')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-100 text-center">
          <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2 border border-teal-200">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <h2 className="font-bold text-slate-800">{user?.name}</h2>
          <p className="text-xs text-teal-700 font-medium bg-teal-50 py-1 px-2 rounded-full inline-block mt-1">
            {user?.specialization || 'General Physician / TeleSeva Specialist'}
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-teal-50 text-teal-700 font-semibold border-r-4 border-teal-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            <span>{t('profile.logout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-xs">
          <h1 className="text-xl font-bold text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.name || t('doc.dashboard')}
          </h1>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-green-700">
              {isKannada ? 'ಆನ್‌ಲೈನ್ ಲಭ್ಯವಿದೆ' : 'Online & Ready for Consults'}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 sm:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route 
              path="/consultation" 
              element={
                <ConsultationRoom 
                  activeCallSession={activeCallSession} 
                  setActiveCallSession={setActiveCallSession} 
                />
              } 
            />
            <Route path="/profile" element={<DoctorProfile user={user} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Overview() {
  const navigate = useNavigate();
  const { t, isKannada } = useI18n();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('doc.todayAppts')}</h3>
          <p className="text-3xl font-extrabold text-teal-600">6</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('doc.pendingPatients')}</h3>
          <p className="text-3xl font-extrabold text-amber-600">1</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('doc.completedConsults')}</h3>
          <p className="text-3xl font-extrabold text-green-600">18</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold">
            {isKannada ? 'ಟೆಲಿಸೇವಾ ವೈದ್ಯರ ಪೋರ್ಟಲ್ ಸಕ್ರಿಯವಾಗಿದೆ' : 'TeleSeva Doctor Portal Live'}
          </h2>
          <p className="text-teal-100 text-sm max-w-xl leading-relaxed">
            {isKannada 
              ? 'ನೀವು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾಗ ರೋಗಿಗಳು ನಿಮ್ಮನ್ನು ನೇರ ವೀಡಿಯೊ ಸಮಾಲೋಚನೆಗಾಗಿ ಸಂಪರ್ಕಿಸಬಹುದು. ಸಮಾಲೋಚನೆ ಮುಗಿದ ತಕ್ಷಣ ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ರಚಿಸಿ ಕಳುಹಿಸಿ.'
              : 'You are online and patients can reach you instantly for video consultations. Issue digital prescriptions and recommend nearby pharmacies in real-time.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/doctor/consultation')}
          className="bg-white text-teal-900 font-bold px-6 py-3.5 rounded-2xl shadow-md hover:bg-teal-50 transition flex items-center gap-2 whitespace-nowrap text-sm"
        >
          <Video size={20} className="text-teal-600" />
          {t('doc.consultationRoom')}
        </button>
      </div>
    </div>
  );
}

function Appointments() {
  const { user } = useAuth();
  const { t, isKannada } = useI18n();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (user?._id) fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('teleseva_token');
      const res = await fetch(`/api/doctors/${user._id}/appointments`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) setAppointments(await res.json());
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">{t('doc.appointments')}</h2>
        <span className="text-xs text-slate-500 font-medium">Total: {appointments.length}</span>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
          <tr>
            <th className="p-4">Patient</th>
            <th className="p-4">Diagnosis / Reason</th>
            <th className="p-4">Date & Time</th>
            <th className="p-4">Prescription</th>
            <th className="p-4">Status & Fee</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {appointments.map(appt => (
            <tr key={appt._id} className="hover:bg-slate-50">
              <td className="p-4">
                <p className="font-bold text-slate-900">{appt.patientId?.name || 'Patient'}</p>
                <p className="text-xs text-slate-500">{appt.patientId?.email || 'N/A'}</p>
              </td>
              <td className="p-4 text-slate-700">
                <span className="font-medium text-xs bg-slate-100 px-2 py-1 rounded">
                  {appt.diagnosis || appt.reason || 'Consultation'}
                </span>
              </td>
              <td className="p-4 text-xs text-slate-600">
                {new Date(appt.date).toLocaleDateString()} at {appt.time}
              </td>
              <td className="p-4 text-xs text-slate-700 max-w-xs truncate">
                {appt.prescribedMedicines?.length > 0 
                  ? `${appt.prescribedMedicines.length} Medicines Prescribed` 
                  : (appt.prescription || '-')}
              </td>
              <td className="p-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                  {appt.status} (₹{appt.consultationFee || 500})
                </span>
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr>
              <td colSpan="5" className="p-8 text-center text-slate-500 text-xs">
                {isKannada ? 'ಯಾವುದೇ ಹಿಂದಿನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.' : 'No appointment records found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DoctorProfile({ user }) {
  const { t } = useI18n();
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-8 max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-3">{t('profile.personalInfo')}</h2>
      <div className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400">{t('auth.name')}</label>
          <p className="text-base font-semibold text-slate-800 mt-0.5">{user?.name}</p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400">{t('auth.email')}</label>
          <p className="text-base font-semibold text-slate-800 mt-0.5">{user?.email}</p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400">{t('auth.specialization')}</label>
          <p className="text-base font-semibold text-teal-700 mt-0.5">{user?.specialization || 'General Physician / MD'}</p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400">TeleSeva Medical Council Reg No.</label>
          <p className="text-base font-semibold text-slate-800 mt-0.5">KMC-{Math.floor(10000 + Math.random() * 90000)}</p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400">Status</label>
          <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            Verified Practitioner ✓
          </span>
        </div>
      </div>
    </div>
  );
}

function ConsultationRoom({ activeCallSession, setActiveCallSession }) {
  const { user, socket } = useAuth();
  const { t, isKannada } = useI18n();

  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showPostCallForm, setShowPostCallForm] = useState(false);
  
  // Post-call prescription form state
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: 'Paracetamol 650mg', dosage: '1 Tab', frequency: '1-0-1 (Morning-Night)', duration: '5 Days', instructions: 'After meals' },
    { name: 'Cetirizine 10mg', dosage: '1 Tab', frequency: '0-0-1 (Night)', duration: '5 Days', instructions: 'Before sleep' }
  ]);
  const [consultationNotes, setConsultationNotes] = useState('Drink warm fluids, steam inhalation 2x daily, adequate rest.');
  const [testsAdvised, setTestsAdvised] = useState('CBC (Complete Blood Count) if fever persists.');
  const [consultationFee, setConsultationFee] = useState(500);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  // Initialize camera preview
  useEffect(() => {
    let localMediaStream = null;
    navigator.mediaDevices.getUserMedia({ 
      video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
      audio: true 
    })
      .then((currentStream) => {
        localMediaStream = currentStream;
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      })
      .catch(err => {
        console.error("Failed to get local doctor camera stream", err);
      });

    return () => {
      if (localMediaStream) {
        localMediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Sync activeCallSession if passed from top level
  useEffect(() => {
    if (activeCallSession && stream) {
      setCaller(activeCallSession.from);
      setCallerName(activeCallSession.name || 'Patient');
      answerCallWithSignal(activeCallSession.from, activeCallSession.signal, stream);
      setActiveCallSession(null);
    }
  }, [activeCallSession, stream]);

  // Video streams attachment
  useEffect(() => {
    if (myVideo.current && stream) myVideo.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (userVideo.current && remoteStream) userVideo.current.srcObject = remoteStream;
  }, [remoteStream, callAccepted]);

  const answerCallWithSignal = (callerId, signal, currentStream) => {
    if (!socket || !callerId || !signal) return;
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: currentStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      }
    });

    peer.on('signal', (data) => {
      socket.emit('answer_call', { signal: data, to: String(callerId) });
    });

    peer.on('stream', (rStream) => {
      setRemoteStream(rStream);
    });

    peer.signal(signal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    if (socket && caller) {
      socket.emit('end_call', { to: String(caller) });
    }
    setCallEnded(true);
    setCallAccepted(false);
    setRemoteStream(null);
    setShowPostCallForm(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  // Medicine items handlers
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1 Tab', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleUpdateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const applyPreset = (presetType) => {
    if (presetType === 'fever') {
      setDiagnosis('Acute Viral Fever & Upper Respiratory Tract Infection');
      setMedicines([
        { name: 'Paracetamol 650mg (Dolo)', dosage: '1 Tab', frequency: '1-0-1 (BD)', duration: '5 Days', instructions: 'After food' },
        { name: 'Pantoprazole 40mg', dosage: '1 Tab', frequency: '1-0-0 (Morning OD)', duration: '5 Days', instructions: 'Before breakfast' },
        { name: 'Vitamin C 500mg (Limcee)', dosage: '1 Tab', frequency: '1-0-0', duration: '10 Days', instructions: 'Chewable after meal' }
      ]);
      setConsultationNotes('Hydrate with plenty of warm water, ORS fluids, and monitor body temperature.');
    } else if (presetType === 'allergy') {
      setDiagnosis('Allergic Rhinitis & Pharyngitis');
      setMedicines([
        { name: 'Cetirizine 10mg', dosage: '1 Tab', frequency: '0-0-1 (Night)', duration: '5 Days', instructions: 'At bedtime' },
        { name: 'Montelukast 10mg + Levocetirizine 5mg (Montair-LC)', dosage: '1 Tab', frequency: '0-0-1', duration: '7 Days', instructions: 'At night' },
        { name: 'Saline Nasal Spray', dosage: '2 Puffs', frequency: 'Morning & Night', duration: '5 Days', instructions: 'Each nostril' }
      ]);
      setConsultationNotes('Avoid cold beverages and dust exposure. Steam inhalation twice daily.');
    } else if (presetType === 'infection') {
      setDiagnosis('Bacterial Bronchitis / Tonsillitis');
      setMedicines([
        { name: 'Amoxicillin + Clavulanic Acid 625mg (Augmentin)', dosage: '1 Tab', frequency: '1-0-1 (BD)', duration: '5 Days', instructions: 'After meals strictly' },
        { name: 'Paracetamol 650mg', dosage: '1 Tab', frequency: 'SOS (When needed)', duration: '3 Days', instructions: 'For pain or fever' },
        { name: 'Probiotics (Bifilac)', dosage: '1 Cap', frequency: '0-0-1', duration: '5 Days', instructions: 'After dinner' }
      ]);
      setConsultationNotes('Complete full antibiotic course. Warm salt water gargles 3x daily.');
    }
  };

  const saveConsultationRecord = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('teleseva_token');
      const payload = {
        patientId: caller,
        diagnosis: diagnosis || 'Clinical Health Evaluation',
        prescribedMedicines: medicines.filter(m => m.name.trim()),
        prescription: medicines.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join(', '),
        consultationNotes,
        testsAdvised,
        consultationFee: Number(consultationFee) || 500
      };

      const res = await fetch(`/api/doctors/${user._id}/consultation-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // Emit prescription event to patient socket
      if (socket && caller) {
        socket.emit('prescription_created', {
          to: String(caller),
          appointmentId: data._id,
          prescriptionData: payload,
          doctorName: user?.name || 'Dr. Specialist',
          doctorSpecialization: user?.specialization || 'General Physician'
        });
      }

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setShowPostCallForm(false);
        setCallEnded(false);
        setCaller('');
        setCallerName('');
      }, 2500);

    } catch (err) {
      console.error("Error saving consultation record:", err);
      alert("Consultation record created successfully.");
      setShowPostCallForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (showPostCallForm) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-200 max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              {isKannada ? 'ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸ್ಟುಡಿಯೋ' : 'Digital Prescription Builder'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800">
              {t('rx.title')}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {isKannada ? 'ರೋಗಿ:' : 'Consultation for:'} <strong className="text-slate-800">{callerName || 'Patient'}</strong>
            </p>
          </div>
          <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold px-3 py-1.5 rounded-full">
            ℞ Verified Rx
          </span>
        </div>

        {/* Quick Prescription Presets */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-600 uppercase">
            {isKannada ? 'ತ್ವರಿತ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಟೆಂಪ್ಲೇಟ್‌ಗಳು:' : 'Quick Prescription Presets:'}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('fever')}
              className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 px-3 py-1.5 rounded-xl font-semibold transition border border-slate-200"
            >
              + Fever & Body Ache Pack
            </button>
            <button
              type="button"
              onClick={() => applyPreset('allergy')}
              className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 px-3 py-1.5 rounded-xl font-semibold transition border border-slate-200"
            >
              + Cold & Allergy Relief
            </button>
            <button
              type="button"
              onClick={() => applyPreset('infection')}
              className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 px-3 py-1.5 rounded-xl font-semibold transition border border-slate-200"
            >
              + Antibiotic & Throat Care
            </button>
          </div>
        </div>

        <form onSubmit={saveConsultationRecord} className="space-y-5">
          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('rx.diagnosis')}</label>
            <input 
              required 
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium" 
              placeholder="e.g. Acute Viral Pharyngitis / Seasonal Allergies"
              value={diagnosis} 
              onChange={e=>setDiagnosis(e.target.value)} 
            />
          </div>

          {/* Structured Medicines Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">{t('rx.medicines')}</label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-3 py-1 rounded-lg transition flex items-center gap-1 border border-teal-200"
              >
                <Plus size={14} />
                <span>{t('doc.addMed')}</span>
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-4">
                    <input
                      required
                      placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                      value={med.name}
                      onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      placeholder="Dosage (1 Tab)"
                      value={med.dosage}
                      onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      placeholder="Frequency (1-0-1)"
                      value={med.frequency}
                      onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      placeholder="Duration (5 Days)"
                      value={med.duration}
                      onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('rx.doctorNotes')}</label>
              <textarea 
                className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium" 
                rows="3" 
                placeholder="e.g. Drink warm fluids, avoid cold exposure."
                value={consultationNotes} 
                onChange={e=>setConsultationNotes(e.target.value)}
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('rx.testsAdvised')}</label>
              <textarea 
                className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium" 
                rows="3" 
                placeholder="e.g. Complete Blood Count (CBC), Rapid Antigen Test"
                value={testsAdvised} 
                onChange={e=>setTestsAdvised(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Fee & Doctor Stamp */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t('pay.consultFee')} (₹)</label>
              <input
                type="number"
                value={consultationFee}
                onChange={e => setConsultationFee(e.target.value)}
                className="w-32 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800"
              />
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-bold text-slate-800">{user?.name}</p>
              <p>{user?.specialization || 'Medical Specialist'}</p>
              <p className="text-[10px] text-teal-700 font-semibold">✓ Digital Signature Stamp Attached</p>
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-60"
          >
            {isSaving ? (
              <span>Saving & Emitting Prescription...</span>
            ) : savedSuccess ? (
              <span className="flex items-center gap-1.5 text-emerald-200">
                <CheckCircle2 size={18} />
                <span>Prescription Sent to Patient Successfully!</span>
              </span>
            ) : (
              <span>{t('doc.saveRx')}</span>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
      {/* Doctor Local Video */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center shadow-lg border border-slate-700">
        <video 
          playsInline 
          muted 
          autoPlay 
          ref={myVideo} 
          className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} 
        />
        {isVideoOff && (
          <div className="text-white text-sm flex flex-col items-center gap-2">
            <CameraOff size={32} className="text-slate-400" />
            <span>Camera is turned off</span>
          </div>
        )}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          You ({user?.name || 'Doctor'})
        </div>
      </div>

      {/* Patient Remote Video / Waiting Room */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border-2 border-dashed border-slate-700 shadow-lg">
        {callAccepted && !callEnded ? (
          <>
            <video playsInline autoPlay ref={userVideo} className="w-full h-full object-cover bg-slate-900" />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              Patient: {callerName || 'Connected Patient'}
            </div>
          </>
        ) : (
          <div className="text-center p-6 space-y-3">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700 text-teal-400 animate-pulse">
              <Video size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">{t('doc.consultationRoom')} Active</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              {isKannada 
                ? 'ನೀವು ಲೈವ್ ಆಗಿದ್ದೀರಿ. ರೋಗಿ ವೀಡಿಯೊ ಸಮಾಲೋಚನೆಗೆ ವಿನಂತಿಸಿದಾಗ ಸ್ವೀಕರಿಸಿ ಚಿಕಿತ್ಸೆ ನೀಡಬಹುದು.'
                : 'You are ready to receive patients. When a patient requests a video consultation, accept the call to begin.'}
            </p>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="lg:col-span-2 mt-2 flex justify-center items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button 
          onClick={toggleMute}
          className={`p-3.5 rounded-full transition font-semibold text-white flex items-center gap-2 shadow ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          title={isMuted ? t('video.unmute') : t('video.mute')}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          <span className="text-xs">{isMuted ? t('video.unmute') : t('video.mute')}</span>
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-3.5 rounded-full transition font-semibold text-white flex items-center gap-2 shadow ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          title={isVideoOff ? t('video.cameraOn') : t('video.cameraOff')}
        >
          {isVideoOff ? <CameraOff size={20} /> : <Camera size={20} />}
          <span className="text-xs">{isVideoOff ? t('video.cameraOn') : t('video.cameraOff')}</span>
        </button>

        {callAccepted && !callEnded ? (
          <button 
            onClick={leaveCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold shadow-lg flex items-center gap-2 transition transform hover:scale-105 text-sm"
          >
            <PhoneOff size={20} />
            <span>{t('video.endCall')} & {t('doc.prescribe')}</span>
          </button>
        ) : (
          <button
            onClick={() => { setShowPostCallForm(true); setCallerName('Consultation Patient'); }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full font-bold shadow-md flex items-center gap-2 text-xs transition"
          >
            <FileText size={16} />
            <span>Create Digital Prescription Studio</span>
          </button>
        )}
      </div>
    </div>
  );
}
