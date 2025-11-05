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
  videoEnabled,
  videoToggle,
  calleeName,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [visible, setVisible] = useState(true);

  // Attach local stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef?.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamRef]);

  // Hide modal when no call is active
  useEffect(() => {
    if (!incomingCall && !isCalling && !callActive) setVisible(false);
    else setVisible(true);
  }, [incomingCall, isCalling, callActive]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-lg rounded-lg p-4 w-80">
      <div className="flex flex-col gap-2">
        {incomingCall ? (
          <>
            <div className="font-semibold">Incoming {incomingCall.callType || "audio"} call</div>
            <div className="text-sm text-gray-600">
              {incomingCall.fromName || "Unknown"}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={() => acceptCallHandler(incomingCall.from)}
              >
                Accept
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => rejectCallHandler(incomingCall.from)}
              >
                Reject
              </button>
            </div>
          </>
        ) : isCalling ? (
          <>
            <div className="font-semibold">
              Calling {calleeName || "User"}...
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => endCallHandler()}
              >
                Cancel
              </button>
            </div>
          </>
        ) : callActive ? (
          <>
            <div className="font-semibold">
              In call with {calleeName || "User"}
            </div>

            {/* Video preview */}
            <div className="flex gap-2 mt-2">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-24 h-24 rounded border border-gray-300"
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-48 rounded border border-gray-300"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2 mt-2">
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded"
                onClick={() => muteToggle()}
              >
                {muted ? "Unmute" : "Mute"}
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded"
                onClick={() => videoToggle()}
              >
                {videoEnabled ? "Stop Video" : "Start Video"}
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => endCallHandler()}
              >
                End Call
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
