import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Peer from 'simple-peer';

export default function DoctorDashboard() {
  const { user, socket, logout } = useAuth();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    // Get local video/audio
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch(err => {
        console.error("Failed to get local stream", err);
      });

    if (socket) {
      socket.on('incoming_call', (data) => {
        setReceivingCall(true);
        setCaller(data.from);
        setCallerName(data.name || 'A Patient');
        setCallerSignal(data.signal);
      });
    }

    return () => {
      if (socket) {
        socket.off('incoming_call');
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [socket]);

  // Make sure to attach stream to video element when it becomes available
  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('answer_call', { signal: data, to: caller });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
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
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    // Optionally notify the other side or just let simple-peer handle connection drop
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden mt-12">
        <div className="bg-slate-800 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-sm text-green-400">Status: Online</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <h2 className="text-lg font-semibold">{user?.name}</h2>
              <p className="text-xs text-slate-300">{user?.specialization || 'General Physician'}</p>
            </div>
            <button 
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            
            {/* My Video */}
            <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
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
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Incoming Call!</h3>
                      <p className="text-slate-500 mb-6">{callerName} is requesting a video consultation.</p>
                      <div className="flex justify-center gap-4">
                        <button onClick={answerCall} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-md">Accept</button>
                        <button onClick={rejectCall} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium shadow-md">Reject</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-50">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9a2.25 2.25 0 0 1 2.25-2.25h7.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25Z" />
                      </svg>
                      <p>Waiting for incoming calls...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {callAccepted && !callEnded && (
            <div className="mt-6 flex justify-center gap-4">
              <button 
                onClick={toggleMute}
                className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-500'} text-white`}
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
      </div>
    </div>
  );
}
