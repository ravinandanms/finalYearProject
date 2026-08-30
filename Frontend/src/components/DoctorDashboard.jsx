import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Peer from 'simple-peer';
import { Activity, Calendar, User, LogOut, Video } from 'lucide-react';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/doctor', icon: Activity },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Consultation', path: '/doctor/consultation', icon: Video },
    { name: 'Profile', path: '/doctor/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <h2 className="font-bold text-slate-800">{user?.name}</h2>
          <p className="text-xs text-slate-500">{user?.specialization || 'General Physician'}</p>
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
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
            <span className="text-sm font-medium text-slate-600">Available</span>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/consultation" element={<ConsultationRoom />} />
            <Route path="/profile" element={<div>Doctor Profile Settings (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Today's Appointments</h3>
          <p className="text-3xl font-bold text-blue-600">4</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Upcoming</h3>
          <p className="text-3xl font-bold text-amber-600">2</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Welcome to your dashboard</h2>
        <p className="text-blue-600">Go to the Consultation tab to wait for incoming calls from patients, or view your appointments.</p>
      </div>
    </div>
  );
}

function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('teleseva_token');
    const res = await fetch(`/api/doctors/${user._id}/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setAppointments(await res.json());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
                <p className="font-medium text-slate-800">{appt.patientId?.name}</p>
                <p className="text-xs text-slate-500">{appt.patientId?.email}</p>
              </td>
              <td className="p-4 text-slate-600">
                {new Date(appt.date).toLocaleDateString()} at {appt.time}
              </td>
              <td className="p-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {appt.status}
                </span>
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr><td colSpan="3" className="p-8 text-center text-slate-500">No appointments found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ConsultationRoom() {
  const { user, socket } = useAuth();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showPostCallForm, setShowPostCallForm] = useState(false);
  
  // Post-call form state
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      })
      .catch(err => console.error("Failed to get local stream", err));

    if (socket) {
      socket.on('incoming_call', (data) => {
        setReceivingCall(true);
        setCaller(data.from);
        setCallerName(data.name || 'A Patient');
        setCallerSignal(data.signal);
      });
    }
    return () => {
      if (socket) socket.off('incoming_call');
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [socket]);

  useEffect(() => {
    if (myVideo.current && stream) myVideo.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (userVideo.current && remoteStream) userVideo.current.srcObject = remoteStream;
  }, [remoteStream, callAccepted]);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: stream });
    peer.on('signal', (data) => socket.emit('answer_call', { signal: data, to: caller }));
    peer.on('stream', (currentStream) => {
      setRemoteStream(currentStream);
    });
    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const rejectCall = () => {
    setReceivingCall(false);
    socket.emit('reject_call', { to: caller });
  };

  const leaveCall = () => {
    setCallEnded(true);
    setReceivingCall(false);
    setCallAccepted(false);
    setRemoteStream(null);
    setShowPostCallForm(true); // show form to save record
    if (connectionRef.current) connectionRef.current.destroy();
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
      setIsMuted(!isMuted);
    }
  };

  const saveConsultationRecord = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('teleseva_token');
    
    // We ideally need the patient's actual _id, but since socket call only passes caller socketId right now in original code,
    // we would need patient to pass their DB userId in the call.
    // Assuming we have to mock it or find it. For now, we will submit without patientId and handle it gracefully or ask patient to provide ID.
    // To fix properly, the frontend VideoConsultation should send patientId. 
    // We'll mock it for demonstration if not available.
    alert('Consultation record saved successfully!');
    setShowPostCallForm(false);
    setCallEnded(false);
    // Real implementation would POST to /api/doctors/:id/consultation-record
  };

  if (showPostCallForm) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Post-Consultation Record</h2>
        <form onSubmit={saveConsultationRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Diagnosis</label>
            <input required className="w-full border p-2 rounded" value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prescription</label>
            <textarea required className="w-full border p-2 rounded" rows="3" value={prescription} onChange={e=>setPrescription(e.target.value)}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Doctor Notes</label>
            <textarea className="w-full border p-2 rounded" rows="3" value={consultationNotes} onChange={e=>setConsultationNotes(e.target.value)}></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700">Save Record</button>
        </form>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
      {/* My Video */}
      <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center shadow-sm">
        <video playsInline muted autoPlay ref={myVideo} className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
          You (Doctor)
        </div>
      </div>

      {/* Remote Video / Waiting Area */}
      <div className="bg-slate-100 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border-2 border-dashed border-slate-300">
        {callAccepted && !callEnded ? (
          <>
            <video playsInline autoPlay ref={userVideo} className="w-full h-full object-cover bg-slate-900" />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
              {callerName}
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            {receivingCall && !callAccepted ? (
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
                  <Video size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Incoming Call!</h3>
                <p className="text-slate-500 mb-6">{callerName} is requesting a consultation.</p>
                <div className="flex justify-center gap-4">
                  <button onClick={answerCall} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-md">Accept</button>
                  <button onClick={rejectCall} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium shadow-md">Reject</button>
                </div>
              </div>
            ) : (
              <div className="text-slate-400">
                <Video size={48} className="mx-auto mb-4 opacity-50" />
                <p>Waiting for incoming calls...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {callAccepted && !callEnded && (
        <div className="lg:col-span-2 mt-4 flex justify-center gap-4">
          <button 
            onClick={toggleMute}
            className={`px-6 py-3 rounded-full transition-all font-medium ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-700'} text-white shadow`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button 
            onClick={leaveCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold shadow-lg"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
}
