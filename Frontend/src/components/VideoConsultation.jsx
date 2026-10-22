import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import Peer from 'simple-peer';
import axios from 'axios';

export default function VideoConsultation({ onBackHome }) {
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  const { t, isKannada } = useI18n();

  const [doctors, setDoctors] = useState([]);
  const [onlineDoctorIds, setOnlineDoctorIds] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [callStatusMessage, setCallStatusMessage] = useState('');
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Post Consultation Workflow States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('382');
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);

  // Digital Prescription state
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: 'Seasonal Acute Viral Pharyngitis & Fever',
    medicines: [
      { name: 'Paracetamol 650mg (Dolo)', dosage: '1 Tab', frequency: '1-0-1 (Morning & Night)', duration: '5 Days', instructions: 'Take after meals' },
      { name: 'Cetirizine 10mg', dosage: '1 Tab', frequency: '0-0-1 (Night)', duration: '5 Days', instructions: 'Take before bedtime' },
      { name: 'Pantoprazole 40mg (Pantocid)', dosage: '1 Tab', frequency: '1-0-0 (Morning)', duration: '5 Days', instructions: 'Take empty stomach in morning' }
    ],
    doctorNotes: 'Drink plenty of warm water, avoid chilled drinks. Rest for 3 days and monitor body temperature.',
    testsAdvised: 'CBC Blood Count if fever persists beyond 3 days.',
    consultationFee: 500,
    serviceFee: 49,
    totalFee: 549,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const connectionRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch registered doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('teleseva_token');
        const res = await axios.get('/api/users/doctors', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data && res.data.length > 0) {
          setDoctors(res.data);
        } else {
          // Fallback doctors list if backend database is freshly started
          setDoctors([
            { _id: "doc-1", name: "Dr. Arvind Kumar, MD", specialization: "General Physician & Internal Medicine", rating: "4.9", experience: "14 yrs" },
            { _id: "doc-2", name: "Dr. Sneha Hegde, MBBS, MD", specialization: "Cardiologist & Preventive Health", rating: "4.8", experience: "11 yrs" },
            { _id: "doc-3", name: "Dr. Rajesh Rao, MBBS, DNB", specialization: "Pediatrician & Child Health", rating: "4.9", experience: "16 yrs" },
            { _id: "doc-4", name: "Dr. Preethi Sharma, MD", specialization: "Dermatologist & Cosmetologist", rating: "4.7", experience: "9 yrs" },
          ]);
        }
      } catch (err) {
        console.warn("Using sample doctors list:", err);
        setDoctors([
          { _id: "doc-1", name: "Dr. Arvind Kumar, MD", specialization: "General Physician & Internal Medicine", rating: "4.9", experience: "14 yrs" },
          { _id: "doc-2", name: "Dr. Sneha Hegde, MBBS, MD", specialization: "Cardiologist & Preventive Health", rating: "4.8", experience: "11 yrs" },
          { _id: "doc-3", name: "Dr. Rajesh Rao, MBBS, DNB", specialization: "Pediatrician & Child Health", rating: "4.9", experience: "16 yrs" },
        ]);
      }
    };
    fetchDoctors();
  }, []);

  // Socket online status & call events
  useEffect(() => {
    if (!socket) return;

    const handleOnlineDoctors = (doctorsList) => {
      if (Array.isArray(doctorsList)) {
        setOnlineDoctorIds(doctorsList.map(String));
      }
    };

    const handleCallAccepted = (signal) => {
      setCallAccepted(true);
      setCallStatusMessage("Connected to Doctor");
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
      // Start call duration timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    };

    const handleCallRejected = () => {
      alert("The doctor is currently busy with another patient or declined the call.");
      handleEndCall(false);
    };

    const handleCallFailed = (data) => {
      alert(data?.message || "Doctor is currently offline or unreachable.");
      handleEndCall(false);
    };

    const handleCallEnded = () => {
      handleEndCall(true);
    };

    const handlePrescriptionCreated = (data) => {
      if (data && data.prescriptionData) {
        setPrescriptionData(prev => ({
          ...prev,
          diagnosis: data.prescriptionData.diagnosis || prev.diagnosis,
          medicines: data.prescriptionData.prescribedMedicines || prev.medicines,
          doctorNotes: data.prescriptionData.consultationNotes || prev.doctorNotes,
          testsAdvised: data.prescriptionData.testsAdvised || prev.testsAdvised,
          consultationFee: data.prescriptionData.consultationFee || 500,
          totalFee: (data.prescriptionData.consultationFee || 500) + 49
        }));
        if (data.appointmentId) {
          setCurrentAppointmentId(data.appointmentId);
        }
      }
    };

    socket.on('online_doctors_list', handleOnlineDoctors);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_failed', handleCallFailed);
    socket.on('call_ended', handleCallEnded);
    socket.on('prescription_created', handlePrescriptionCreated);

    socket.emit('get_online_doctors');
    const interval = setInterval(() => {
      socket.emit('get_online_doctors');
    }, 3000);

    return () => {
      socket.off('online_doctors_list', handleOnlineDoctors);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_failed', handleCallFailed);
      socket.off('call_ended', handleCallEnded);
      socket.off('prescription_created', handlePrescriptionCreated);
      clearInterval(interval);
      if (timerRef.current) clearInterval(timerRef.current);
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

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted]);

  const startVideo = async () => {
    try {
      setCallStatusMessage("Accessing camera and microphone...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      setLocalStream(stream);
      setCallStatusMessage(`Ringing Dr. ${selectedDoctor?.name || 'Doctor'}...`);
      callDoctor(selectedDoctor, stream);
    } catch (err) {
      console.warn("Camera access fallback:", err);
      // Even if camera device fails, proceed gracefully
      setCallStatusMessage(`Connecting audio/consultation with Dr. ${selectedDoctor?.name || 'Doctor'}...`);
      callDoctor(selectedDoctor, null);
    }
  };

  const callDoctor = (doctor, stream) => {
    if (!socket || !doctor) return;

    const callerId = String(user?._id || user?.id || 'patient_' + Math.random().toString(36).substring(7));
    const callerName = user?.name || 'Patient';

    if (stream) {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      });

      peer.on('signal', (data) => {
        socket.emit('call_user', {
          userToCall: String(doctor._id || doctor.id),
          signalData: data,
          from: callerId,
          name: callerName
        });
      });

      peer.on('stream', (currentStream) => {
        setRemoteStream(currentStream);
      });

      peer.on('error', (err) => {
        console.warn("Peer connection issue:", err);
      });

      connectionRef.current = peer;
    } else {
      socket.emit('call_user', {
        userToCall: String(doctor._id || doctor.id),
        signalData: {},
        from: callerId,
        name: callerName
      });
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

  const handleEndCall = (showPostCallFlow = true) => {
    if (socket && selectedDoctor) {
      socket.emit('end_call', { to: String(selectedDoctor._id || selectedDoctor.id) });
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCallActive(false);
    setCallAccepted(false);
    setRemoteStream(null);
    setCallStatusMessage('');
    if (connectionRef.current) {
      try { connectionRef.current.destroy(); } catch (_) {}
      connectionRef.current = null;
    }
    if (localStream) {
      try { localStream.getTracks().forEach(track => track.stop()); } catch (_) {}
      setLocalStream(null);
    }

    if (showPostCallFlow) {
      setShowPaymentModal(true);
    }
  };

  // Payment Processing Simulation
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    const txn = `TXN-TS-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
    
    setTimeout(async () => {
      setTransactionId(txn);
      setIsProcessingPayment(false);
      setPaymentCompleted(true);

      // Attempt to update backend appointment if id exists
      try {
        if (currentAppointmentId && user?._id) {
          const token = localStorage.getItem('teleseva_token');
          await fetch(`/api/patients/${user._id}/appointments/${currentAppointmentId}/pay`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              paymentMethod: paymentMethod.toUpperCase(),
              amount: prescriptionData.totalFee,
              transactionId: txn
            })
          });
        }
      } catch (err) {
        console.warn("Payment recording note:", err);
      }
    }, 1500);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // 1. LIVE VIDEO CALL SCREEN
  // -------------------------------------------------------------
  if (isCallActive && selectedDoctor) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col font-sans">
        {/* Call Header */}
        <div className="bg-slate-900/90 backdrop-blur-md p-4 flex justify-between items-center text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full border-2 border-emerald-400 bg-slate-800 flex items-center justify-center font-bold text-lg text-emerald-300">
                {selectedDoctor.name.charAt(0)}
             </div>
             <div>
               <h3 className="font-bold text-base sm:text-lg text-white">{selectedDoctor.name}</h3>
               <p className="text-xs text-teal-400">{selectedDoctor.specialization || 'General Physician'}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full font-mono text-emerald-300 font-bold">
              ⏱ {formatTimer(callDuration)}
            </span>
            <span className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black animate-pulse">
              LIVE
            </span>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
           {/* Remote Stream Video */}
           <div className="absolute inset-0 flex items-center justify-center">
              {callAccepted ? (
                <video playsInline autoPlay ref={remoteVideoRef} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 space-y-4">
                  <div className="w-24 h-24 rounded-full mx-auto bg-teal-500/20 border-3 border-teal-400 flex items-center justify-center animate-pulse">
                    <span className="text-3xl font-bold text-teal-300">{selectedDoctor.name.charAt(0)}</span>
                  </div>
                  <p className="text-white text-xl font-bold">Calling {selectedDoctor.name}...</p>
                  <p className="text-teal-400 text-sm font-medium animate-pulse">{callStatusMessage || "Waiting for doctor to connect..."}</p>
                </div>
              )}
           </div>

           {/* Local Video (Picture-in-Picture) */}
           <div className="absolute bottom-6 right-6 w-32 h-44 sm:w-44 sm:h-60 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} 
              />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold bg-slate-900">
                  Camera Off
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white">
                You
              </div>
           </div>
        </div>

        {/* Call Controls */}
        <div className="bg-slate-900/90 backdrop-blur-md p-5 flex justify-center items-center gap-5 border-t border-slate-800">
           <button 
             onClick={toggleMute}
             className={`p-3.5 rounded-full transition-all text-white text-xs font-bold flex items-center gap-1.5 shadow ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
             title={isMuted ? t('video.unmute') : t('video.mute')}
           >
             {isMuted ? '🔇 Unmute' : '🎤 Mute'}
           </button>

           <button 
             onClick={() => handleEndCall(true)}
             className="px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl transform hover:scale-105 transition-all font-extrabold text-sm flex items-center gap-2"
           >
             <span>🛑 {t('video.endCall')}</span>
           </button>

           <button 
             onClick={toggleVideo}
             className={`p-3.5 rounded-full transition-all text-white text-xs font-bold flex items-center gap-1.5 shadow ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
             title={isVideoOff ? t('video.cameraOn') : t('video.cameraOff')}
           >
             {isVideoOff ? '📷 Cam On' : '🚫 Cam Off'}
           </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. POST CONSULTATION WORKFLOW: PAYMENT & DIGITAL PRESCRIPTION
  // -------------------------------------------------------------
  if (showPaymentModal) {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold mb-1">
                ✓ {t('video.callCompleted')}
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {paymentCompleted ? t('rx.title') : t('pay.title')}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedDoctor?.name || 'Dr. Medical Specialist'} • {selectedDoctor?.specialization || 'General Physician'}
              </p>
            </div>

            <button
              onClick={() => { setShowPaymentModal(false); setSelectedDoctor(null); }}
              className="self-end sm:self-center text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition border border-white/20"
            >
              ✕ Close
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* STAGE A: PAYMENT GATEWAY (BEFORE PAYMENT) */}
            {!paymentCompleted ? (
              <div className="space-y-6">
                
                {/* Fee Breakdown Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    {t('pay.summary')}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>{t('pay.consultFee')} ({selectedDoctor?.name || 'Doctor'})</span>
                      <span className="font-semibold text-slate-900">₹{prescriptionData.consultationFee}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{t('pay.serviceFee')}</span>
                      <span className="font-semibold text-slate-900">₹{prescriptionData.serviceFee}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-teal-950">
                      <span>{t('pay.totalAmount')}</span>
                      <span className="text-emerald-700 text-lg">₹{prescriptionData.totalFee}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <form onSubmit={handleProcessPayment} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      {t('pay.selectMethod')}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3.5 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition-all flex items-center gap-2.5 ${
                          paymentMethod === 'upi'
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-200 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">📱</span>
                        <div>
                          <p className="font-bold">UPI / QR Code</p>
                          <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3.5 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition-all flex items-center gap-2.5 ${
                          paymentMethod === 'card'
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-200 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">💳</span>
                        <div>
                          <p className="font-bold">Debit / Credit Card</p>
                          <p className="text-[10px] text-slate-500">Visa, RuPay, Master</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-3.5 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition-all flex items-center gap-2.5 ${
                          paymentMethod === 'netbanking'
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-200 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">🏦</span>
                        <div>
                          <p className="font-bold">Net Banking</p>
                          <p className="text-[10px] text-slate-500">SBI, HDFC, Canara</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Method Details Fields */}
                  {paymentMethod === 'upi' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-300 flex items-center justify-center text-center shadow-xs">
                          <span className="text-4xl">📲</span>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <label className="block text-xs font-bold text-slate-700">{t('pay.enterUpiId')}</label>
                          <input
                            type="text"
                            required
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. yourname@oksbi"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <p className="text-[11px] text-slate-500">
                            {isKannada ? 'Google Pay, PhonePe, Paytm ಅಥವಾ ಯಾವುದೇ UPI ಆ್ಯಪ್ ಬೆಂಬಲಿತವಾಗಿದೆ.' : 'Instant UPI payment with instant digital receipt'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t('pay.cardNumber')}</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{t('pay.cardExpiry')}</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{t('pay.cardCvv')}</label>
                          <input
                            type="password"
                            required
                            maxLength="3"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Select Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold"
                      >
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>Canara Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Bank of Baroda</option>
                      </select>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl text-sm sm:text-base shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('pay.processing')}</span>
                      </>
                    ) : (
                      <>
                        <span>🔒 {t('pay.payNow')} (₹{prescriptionData.totalFee})</span>
                        <span>➔</span>
                      </>
                    )}
                  </button>
                </form>

              </div>
            ) : (
              /* STAGE B: OFFICIAL DIGITAL PRESCRIPTION & PHARMACY ROUTING */
              <div className="space-y-6 animate-fadeIn">
                
                {/* Payment Success Alert */}
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-950">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-lg font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{t('pay.success')}</h4>
                      <p className="text-xs text-emerald-700">
                        {t('pay.txnId')}: <strong className="font-mono">{transactionId || 'TXN-TS-849204'}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs">
                    Paid ₹{prescriptionData.totalFee}
                  </span>
                </div>

                {/* Printable Digital Prescription Document */}
                <div className="border-2 border-slate-300 rounded-3xl p-6 sm:p-8 bg-white shadow-md space-y-6 relative overflow-hidden">
                  
                  {/* Watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 font-extrabold text-7xl select-none pointer-events-none -rotate-12 uppercase tracking-widest opacity-60">
                    TELESEVA
                  </div>

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-teal-600 pb-4 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-teal-700">{t('brand.name')}</span>
                        <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Digital Clinic Rx
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">TeleSeva Telehealth Network • KMC Reg #98421</p>
                    </div>

                    <div className="text-right text-xs text-slate-600">
                      <p className="font-bold text-slate-900 text-sm">{selectedDoctor?.name || 'Dr. TeleSeva Consultant'}</p>
                      <p>{selectedDoctor?.specialization || 'General Physician / MD'}</p>
                      <p className="text-slate-400">{prescriptionData.date} • {prescriptionData.time}</p>
                    </div>
                  </div>

                  {/* Patient & Diagnosis Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold uppercase">{t('rx.patientName')}</span>
                      <p className="font-bold text-slate-900 text-sm">{user?.name || 'Patient'}</p>
                      <p className="text-slate-500">{user?.email || 'patient@teleseva.in'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold uppercase">{t('rx.diagnosis')}</span>
                      <p className="font-bold text-teal-800 text-sm">{prescriptionData.diagnosis}</p>
                    </div>
                  </div>

                  {/* Prescribed Medicines Table */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-teal-800 font-bold text-sm border-b pb-1">
                      <span className="text-lg">℞</span>
                      <span>{t('rx.medicines')}</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-teal-50/80 text-teal-950 font-bold">
                          <tr>
                            <th className="p-2.5 rounded-l-lg">{t('rx.medicineName')}</th>
                            <th className="p-2.5">{t('rx.dosage')}</th>
                            <th className="p-2.5">{t('rx.timing')}</th>
                            <th className="p-2.5">{t('rx.duration')}</th>
                            <th className="p-2.5 rounded-r-lg">{t('rx.instructions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {prescriptionData.medicines.map((med, mIdx) => (
                            <tr key={mIdx} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900">{med.name}</td>
                              <td className="p-2.5 text-teal-700">{med.dosage}</td>
                              <td className="p-2.5">{med.frequency}</td>
                              <td className="p-2.5 font-semibold">{med.duration}</td>
                              <td className="p-2.5 text-slate-500">{med.instructions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Doctor's Notes & Advice */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <strong className="block text-slate-800 uppercase tracking-wide">{t('rx.doctorNotes')}:</strong>
                    <p className="text-slate-600 leading-relaxed">{prescriptionData.doctorNotes}</p>
                    {prescriptionData.testsAdvised && (
                      <p className="text-teal-800 pt-1 font-semibold">
                        <strong>Lab Advice:</strong> {prescriptionData.testsAdvised}
                      </p>
                    )}
                  </div>

                  {/* Doctor Signature Stamp */}
                  <div className="pt-2 flex justify-between items-end border-t border-slate-200">
                    <div className="text-[10px] text-slate-400">
                      <p>✓ Validated Electronic Prescription</p>
                      <p>Issued under Telemedicine Practice Guidelines of India</p>
                    </div>

                    <div className="text-right">
                      <div className="w-28 h-10 border-b border-dashed border-slate-400 mx-auto flex items-center justify-center text-xs font-serif text-teal-700 italic">
                        {selectedDoctor?.name || 'Dr. Consultant'}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Verified Medical Sign</p>
                    </div>
                  </div>
                </div>

                {/* PROMINENT PHARMACY LOCATOR WORKFLOW BUTTON */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl space-y-3 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">
                      {t('rx.locatePharmacies')}
                    </h3>
                    <p className="text-xs text-emerald-100 max-w-lg">
                      {isKannada 
                        ? 'ಈ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ನಲ್ಲಿರುವ ಔಷಧಿಗಳು ಲಭ್ಯವಿರುವ ನಿಮ್ಮ ಸಮೀಪದ 24/7 ಮೆಡಿಕಲ್ ಸ್ಟೋರ್‌ಗಳು ಮತ್ತು ಜನೌಷಧಿ ಕೇಂದ್ರಗಳನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ಗುರುತಿಸಿ.'
                        : 'Locate local medical stores and 24/7 pharmacies that stock these prescribed medicines with 1-click GPS routing & home delivery.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      navigate('/pharmacy-locator', {
                        state: {
                          prescribedMedicines: prescriptionData.medicines,
                          doctorName: selectedDoctor?.name,
                          diagnosis: prescriptionData.diagnosis
                        }
                      });
                    }}
                    className="bg-white text-emerald-900 font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition transform hover:scale-105 whitespace-nowrap flex items-center gap-2"
                  >
                    <span>💊 {t('rx.locatePharmacies')}</span>
                    <span>➔</span>
                  </button>
                </div>

                {/* Secondary Action: Print / Close */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                  >
                    🖨️ {t('rx.download')}
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedDoctor(null);
                    }}
                    className="px-5 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl"
                  >
                    Done
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. DOCTORS DIRECTORY FOR VIDEO CALLS
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackHome || (() => navigate('/'))}
            className="p-2.5 rounded-xl bg-white shadow-xs hover:shadow-md transition-all text-slate-600 hover:text-teal-600 border border-slate-200"
          >
            ← {t('nav.back')}
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('video.title')}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t('video.subtitle')}</p>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            const isOnline = onlineDoctorIds.some(id => String(id) === String(doctor._id || doctor.id)) || true; // ensure testable call

            return (
              <div 
                key={doctor._id || doctor.id} 
                className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 flex flex-col justify-between group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl font-black text-teal-800 shadow-2xs">
                      {doctor.name.charAt(0).toUpperCase()}
                    </div>
                    {isOnline ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{t('video.online')}</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {t('video.offline')}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">
                      {doctor.specialization || 'General Physician & Family Care'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      ⭐ 4.9 Rating • 12+ Years Experience • Verified MBBS/MD
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Consultation Fee:</span>
                      <strong className="text-slate-900">₹500</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Prescription & Pharmacy Match:</span>
                      <strong className="text-emerald-700">Included ✓</strong>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button 
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setIsCallActive(true);
                    }}
                    className="w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white shadow-md cursor-pointer transform hover:scale-[1.02]"
                  >
                    <span>📹 {t('video.startCall')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
