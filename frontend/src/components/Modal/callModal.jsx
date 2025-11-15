import React, { useEffect, useRef, useState } from "react";

export default function CallModal({
  incomingCall,
  isCalling,
  callActive,
  startCallHandler,
  acceptCallHandler,
  rejectCallHandler,
  endCallHandler,
  localStreamRef, // ref from hook
  remoteStreamRef, // ref from hook
  muted,
  muteToggle,
  videoEnabled,
  videoToggle,
  calleeName,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [visible, setVisible] = useState(true);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef?.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamRef?.current]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef?.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamRef?.current]);

  // Control modal visibility
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
            <div className="font-semibold">
              Incoming {incomingCall.type || "audio"} call
            </div>
            <div className="text-sm text-gray-600">{incomingCall.fromName || "Unknown"}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={() => acceptCallHandler()}
              >
                Accept
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => rejectCallHandler()}
              >
                Reject
              </button>
            </div>
          </>
        ) : isCalling ? (
          <>
            <div className="font-semibold">Calling {calleeName || "User"}...</div>
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
            <div className="font-semibold text-green-600 animate-pulse">📞 Call Active</div>

            <div className="font-semibold">In call with {calleeName || "User"}</div>

            {/* Video Preview */}
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