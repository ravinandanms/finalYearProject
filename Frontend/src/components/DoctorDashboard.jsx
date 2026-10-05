import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Peer from 'simple-peer';
import { Activity, Calendar, User, LogOut, Video, PhoneIncoming, PhoneOff, Check, Mic, MicOff, Camera, CameraOff } from 'lucide-react';

export default function DoctorDashboard() {
  const { user, socket, logout } = useAuth();
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
    { name: 'Overview', path: '/doctor', icon: Activity },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Consultation', path: '/doctor/consultation', icon: Video },
    { name: 'Profile', path: '/doctor/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {/* Global Incoming Call Popup Notification */}
      {incomingCallData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border-2 border-teal-500 text-center animate-bounce-short">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-md">
              <PhoneIncoming size={36} className="text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Incoming Consultation Call!</h2>
            <p className="text-slate-600 font-medium mb-6">
              <span className="text-teal-700 font-semibold">{incomingCallData.name || 'A Patient'}</span> is calling for a live video consultation.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAcceptIncomingCall}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105"
              >
                <Check size={20} />
                Accept Call
              </button>
              <button
                onClick={handleRejectIncomingCall}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <PhoneOff size={20} />
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b text-center">
          <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2 border border-teal-200">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <h2 className="font-bold text-slate-800">{user?.name}</h2>
          <p className="text-xs text-teal-700 font-medium bg-teal-50 py-1 px-2 rounded-full inline-block mt-1">
            {user?.specialization || 'General Physician'}
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
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-50 text-teal-700 font-semibold border-r-4 border-teal-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-green-700">Online & Ready</span>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Today's Appointments</h3>
          <p className="text-3xl font-bold text-teal-600">4</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Pending Patients</h3>
          <p className="text-3xl font-bold text-amber-600">2</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Completed Consultations</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">TeleSeva Doctor Portal Live</h2>
          <p className="text-teal-100 max-w-xl">
            You are online and patients can find you in the Video Consultation directory. Keep your status active to receive incoming instant video consultation calls.
          </p>
        </div>
        <button
          onClick={() => navigate('/doctor/consultation')}
          className="bg-white text-teal-800 font-bold px-6 py-3 rounded-xl shadow hover:bg-teal-50 transition flex items-center gap-2 whitespace-nowrap"
        >
          <Video size={20} className="text-teal-600" />
          Open Consultation Room
        </button>
      </div>
    </div>
  );
}

function Appointments() {
  const { user } = useAuth();
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
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-slate-800">Scheduled Appointments</h2>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-4 font-medium text-slate-600">Patient</th>
            <th className="p-4 font-medium text-slate-600">Date/Time</th>
            <th className="p-4 font-medium text-slate-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {appointments.map(appt => (
            <tr key={appt._id} className="hover:bg-slate-50">
              <td className="p-4">
                <p className="font-medium text-slate-800">{appt.patientId?.name || 'Patient'}</p>
                <p className="text-xs text-slate-500">{appt.patientId?.email || 'N/A'}</p>
              </td>
              <td className="p-4 text-slate-600">
                {new Date(appt.date).toLocaleDateString()} at {appt.time}
              </td>
              <td className="p-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  {appt.status}
                </span>
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr><td colSpan="3" className="p-8 text-center text-slate-500">No scheduled appointments for today.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DoctorProfile({ user }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-8 max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Doctor Profile Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400">Full Name</label>
          <p className="text-lg font-medium text-slate-800">{user?.name}</p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400">Email Address</label>
          <p className="text-lg font-medium text-slate-800">{user?.email}</p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400">Specialization</label>
          <p className="text-lg font-medium text-slate-800">{user?.specialization || 'AYUSH / General'}</p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400">Account Status</label>
          <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold capitalize">
            {user?.status || 'Active'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ConsultationRoom({ activeCallSession, setActiveCallSession }) {
  const { user, socket } = useAuth();
  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showPostCallForm, setShowPostCallForm] = useState(false);
  
  // Post-call form state
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');

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
      setCallerSignal(activeCallSession.signal);
      
      // Auto-answer the call
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
      console.log("[Doctor] Emitting answer_call to patient:", callerId);
      socket.emit('answer_call', { signal: data, to: String(callerId) });
    });

    peer.on('stream', (rStream) => {
      console.log("[Doctor] Received remote stream from patient!");
      setRemoteStream(rStream);
    });

    peer.on('error', (err) => {
      console.error("[Doctor] Peer connection error:", err);
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

  const saveConsultationRecord = async (e) => {
    e.preventDefault();
    alert('Consultation record saved successfully!');
    setShowPostCallForm(false);
    setCallEnded(false);
    setCaller('');
    setCallerName('');
    setDiagnosis('');
    setPrescription('');
    setConsultationNotes('');
  };

  if (showPostCallForm) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Post-Consultation Record</h2>
        <p className="text-slate-500 text-sm mb-6">Create prescription and summary notes for {callerName || 'Patient'}</p>
        <form onSubmit={saveConsultationRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Diagnosis</label>
            <input 
              required 
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" 
              placeholder="e.g. Seasonal Allergic Rhinitis / Acute Bronchitis"
              value={diagnosis} 
              onChange={e=>setDiagnosis(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Prescription / Medication Instructions</label>
            <textarea 
              required 
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" 
              rows="3" 
              placeholder="e.g. Tab Cetirizine 10mg OD x 5 days, Steam Inhalation BD"
              value={prescription} 
              onChange={e=>setPrescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Doctor Notes & Dietary Recommendations</label>
            <textarea 
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" 
              rows="3" 
              placeholder="e.g. Drink warm fluids, avoid cold exposure."
              value={consultationNotes} 
              onChange={e=>setConsultationNotes(e.target.value)}
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition"
          >
            Save & Finalize Record
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
      {/* Doctor Video */}
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

      {/* Patient Video / Waiting Room */}
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
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 text-teal-400">
              <Video size={36} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Consultation Room Active</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              You are ready to receive patients. When a patient requests a video consultation, you can accept their call immediately.
            </p>
          </div>
        )}
      </div>

      {/* Doctor Call Controls */}
      <div className="lg:col-span-2 mt-2 flex justify-center items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <button 
          onClick={toggleMute}
          className={`p-3.5 rounded-full transition font-semibold text-white flex items-center gap-2 shadow ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-3.5 rounded-full transition font-semibold text-white flex items-center gap-2 shadow ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isVideoOff ? <CameraOff size={20} /> : <Camera size={20} />}
          <span className="text-xs">{isVideoOff ? 'Camera Off' : 'Camera On'}</span>
        </button>

        {callAccepted && !callEnded && (
          <button 
            onClick={leaveCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold shadow-lg flex items-center gap-2 transition transform hover:scale-105"
          >
            <PhoneOff size={20} />
            End Consultation
          </button>
        )}
      </div>
    </div>
  );
}

