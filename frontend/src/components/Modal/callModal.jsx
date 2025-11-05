// src/components/CallModal.jsx
import React, { useEffect, useRef, useState } from "react";

export default function CallModal({
  incomingCall,
  isCalling,
  callActive,
  startCallHandler,
  acceptCallHandler,
  rejectCallHandler,
  endCallHandler,
  localStream,
  remoteStreamRef,
  muted,
  muteToggle,
  calleeName,
}) {
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
      localAudioRef.current.muted = true; // avoid echo
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStreamRef?.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamRef]);

  // Hide modal when no active states
  useEffect(() => {
    if (!incomingCall && !isCalling && !callActive) setVisible(false);
    else setVisible(true);
  }, [incomingCall, isCalling, callActive]);

  if (!visible) return null;
  console.log("incomingCall in CallModal:", incomingCall);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-lg rounded-lg p-4 w-80">
      <div className="flex flex-col gap-2">
        {incomingCall ? (
          <>
            <div className="font-semibold">Incoming audio call</div>
            <div className="text-sm text-gray-600">{incomingCall.localUserName  || 'Unknown'}</div>
            <div className="flex gap-2 mt-2">
              <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => acceptCallHandler(incomingCall.from)}>Accept</button>
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => rejectCallHandler(incomingCall.from)}>Reject</button>
            </div>
          </>
        ) : isCalling ? (
          <>
            <div className="font-semibold">Calling {calleeName || "User"}...</div>
            <div className="flex gap-2 mt-2">
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => endCallHandler()}>Cancel</button>
            </div>
          </>
        ) : callActive ? (
          <>
            <div className="font-semibold">In call with {calleeName || "User"}</div>
            <div className="flex gap-2 mt-2">
              <button className="bg-gray-500 text-white px-3 py-1 rounded" onClick={() => muteToggle()}>{muted ? 'Unmute' : 'Mute'}</button>
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => endCallHandler()}>End Call</button>
            </div>
          </>
        ) : null}
      </div>

      {/* invisible audio elements for playback */}
      <audio ref={localAudioRef} autoPlay playsInline />
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </div>
  );
}
