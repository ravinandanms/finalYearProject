import React, { useState, useEffect, useRef } from 'react';
import { DOCTORS } from '../data/doctors';
import { useI18n } from '../context/I18nContext';

export default function VideoConsultation({ onBackHome }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    if (isCallActive) {
      startVideo();
    } else {
      stopVideo();
    }
    return () => stopVideo();
  }, [isCallActive]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Could not access camera/microphone. Please check permissions.");
      setIsCallActive(false);
    }
  };

  const stopVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
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
    setIsCallActive(false);
    setSelectedDoctor(null);
  };

  if (isCallActive && selectedDoctor) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400">
                <img src={selectedDoctor.img} alt={selectedDoctor.name} className="w-full h-full object-cover" />
             </div>
             <div>
               <h3 className="font-semibold text-lg">{selectedDoctor.name}</h3>
               <p className="text-xs text-slate-300">{selectedDoctor.title}</p>
             </div>
          </div>
          <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            LIVE
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
           {/* Remote Video (Simulated with placeholder or same stream for demo) */}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center opacity-50">
                <img src={selectedDoctor.img} alt="Remote" className="w-32 h-32 rounded-full mx-auto mb-4 opacity-50 grayscale" />
                <p className="text-white text-xl">Connecting to {selectedDoctor.name}...</p>
              </div>
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
             {isMuted ? (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
               </svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
               </svg>
             )}
           </button>

           <button 
             onClick={handleEndCall}
             className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transform hover:scale-110 transition-all"
             title="End Call"
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m-1.5.75a8.627 8.627 0 0 0-7.312 3.623l-.948 1.542-1.818-.818a4.5 4.5 0 0 0-3.09 6.31l1.685 3.41a2.25 2.25 0 0 0 3.015.98l1.725-.774a4.5 4.5 0 0 0 2.625-4.16V10.5Z" />
             </svg>
           </button>

           <button 
             onClick={toggleVideo}
             className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} text-white`}
             title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
           >
             {isVideoOff ? (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9a2.25 2.25 0 0 1 2.25-2.25h7.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25Z" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
               </svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9a2.25 2.25 0 0 1 2.25-2.25h7.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25Z" />
               </svg>
             )}
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Video Consultation</h1>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
           <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9a2.25 2.25 0 0 1 2.25-2.25h7.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Instant Video Connect</h3>
                <p className="text-blue-800 text-sm">Select a doctor below to start a secure video consultation immediately. Ensure your camera and microphone permissions are enabled.</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCTORS.map((doctor, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group">
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img src={doctor.img} alt={doctor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-4 left-4 z-20 text-white">
                   <p className="text-xs font-medium bg-green-500 px-2 py-0.5 rounded-full inline-block mb-1">Available</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">{doctor.name}</h3>
                <p className="text-slate-500 font-medium mb-4">{doctor.title}</p>
                
                <button 
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setIsCallActive(true);
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9a2.25 2.25 0 0 1 2.25-2.25h7.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25Z" />
                  </svg>
                  Start Video Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
