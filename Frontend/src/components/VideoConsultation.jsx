import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import Peer from 'simple-peer';
import axios from 'axios';

export default function VideoConsultation({ onBackHome }) {
  const { user, socket } = useAuth();
  const { t } = useI18n();

  const [doctors, setDoctors] = useState([]);
  const [onlineDoctorIds, setOnlineDoctorIds] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    // Fetch all doctors from API
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('teleseva_token');
        const res = await axios.get('/api/users/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctors(res.data);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('online_doctors_list', (doctorsList) => {
        setOnlineDoctorIds(doctorsList);
      });
      
      socket.on('call_accepted', (signal) => {
        setCallAccepted(true);
        if (connectionRef.current) {
          connectionRef.current.signal(signal);
        }
      });

      socket.on('call_rejected', () => {
        alert("The doctor rejected the call or is busy.");
        handleEndCall();
      });
      
      // Request the current online doctors in case we missed the broadcast
      socket.emit('get_online_doctors');
    }

    return () => {
      if (socket) {
        socket.off('online_doctors_list');
        socket.off('call_accepted');
        socket.off('call_rejected');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (isCallActive && !localStream) {
      startVideo();
    }
  }, [isCallActive]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCallActive]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      callDoctor(selectedDoctor, stream);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Could not access camera/microphone. Please check permissions.");
      setIsCallActive(false);
      setSelectedDoctor(null);
    }
  };

  const callDoctor = (doctor, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      socket.emit('call_user', {
        userToCall: doctor._id,
        signalData: data,
        from: user._id || user.email, // Adjust based on your identifier
        name: user.name
      });
    });

    peer.on('stream', (currentStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = currentStream;
      }
    });

    connectionRef.current = peer;
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = () => {
    setCallEnded(true);
    setIsCallActive(false);
    setSelectedDoctor(null);
    setCallAccepted(false);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  if (isCallActive && selectedDoctor) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400 bg-slate-700 flex items-center justify-center">
                <span className="text-xl font-bold">{selectedDoctor.name.charAt(0)}</span>
             </div>
             <div>
               <h3 className="font-semibold text-lg">{selectedDoctor.name}</h3>
               <p className="text-xs text-slate-300">{selectedDoctor.specialization || 'General'}</p>
             </div>
          </div>
          <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            LIVE
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
           {/* Remote Video */}
           <div className="absolute inset-0 flex items-center justify-center">
              {callAccepted ? (
                <video playsInline autoPlay ref={remoteVideoRef} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center opacity-50">
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-slate-700 flex items-center justify-center border border-slate-500">
                    <span className="text-5xl font-bold text-white">{selectedDoctor.name.charAt(0)}</span>
                  </div>
                  <p className="text-white text-xl">Calling {selectedDoctor.name}...</p>
                </div>
              )}
           </div>

           {/* Local Video (PiP) */}
           <div className="absolute bottom-4 right-4 w-32 h-48 md:w-48 md:h-64 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-600 shadow-2xl">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} 
              />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  Camera Off
                </div>
              )}
           </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 p-6 flex justify-center items-center gap-6">
           <button 
             onClick={toggleMute}
             className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} text-white`}
             title={isMuted ? "Unmute" : "Mute"}
           >
             {isMuted ? 'Unmute' : 'Mute'}
           </button>

           <button 
             onClick={handleEndCall}
             className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transform hover:scale-110 transition-all font-bold px-6"
           >
             End Call
           </button>

           <button 
             onClick={toggleVideo}
             className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} text-white`}
             title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
           >
             {isVideoOff ? 'Cam On' : 'Cam Off'}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBackHome}
            className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-green-600"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Video Consultation</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            // Check if doctor is in online list
            // We use _id because that's what the backend broadcasts
            const isOnline = onlineDoctorIds.includes(doctor._id);

            return (
              <div key={doctor._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-600">
                      {doctor.name.charAt(0).toUpperCase()}
                    </div>
                    {isOnline ? (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 block"></span> Online
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        Offline
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{doctor.name}</h3>
                  <p className="text-slate-500 font-medium mb-4">{doctor.specialization || 'General Physician'}</p>
                  
                  <button 
                    disabled={!isOnline}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setIsCallActive(true);
                    }}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isOnline 
                        ? 'bg-slate-900 hover:bg-green-600 text-white cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Start Video Call
                  </button>
                </div>
              </div>
            );
          })}
          {doctors.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No doctors found. Please ensure doctors are registered in the system.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
