// src/components/MessageContainer.jsx
import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { IoCall, IoVideocam } from "react-icons/io5";
import { useAuthContext } from "../../context/AuthContext";

import useCall from "../../hooks/userCall"; // make sure this handles audio/video
import CallModal from "../Modal/callModal"; // adjust path
import { useSocketContext } from "../../context/SocketContext";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { authUser } = useAuthContext();
  const { onlineUsers } = useSocketContext();
  const isOnline =
    selectedConversation && onlineUsers.includes(selectedConversation._id);

  const {
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    muteToggle,
    videoToggle,
    isCalling,
    incomingCall,
    callActive,
    localStream,
    remoteStream,
    muted,
    videoEnabled,
  } = useCall({
    conversationId: selectedConversation
      ? String(selectedConversation.id)
      : "no-room",
    localUserId: authUser?.id || "unknown",
    localUserName: authUser?.fullName,
  });

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  const handleAudioCall = () => {
    if (!selectedConversation) return;
    startCall(selectedConversation.participantId || selectedConversation.id, {
      type: "audio",
    });
  };

  const handleVideoCall = () => {
    if (!selectedConversation) return;
    startCall(selectedConversation.participantId || selectedConversation.id, {
      type: "video",
    });
  };

  return (
    <div className="md:min-w-[750px] flex flex-col">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Header */}
          <div className="bg-slate-500 px-4 py-2 mb-2 flex justify-between items-center">
            <div>
              <span className="label-text">To:</span>{" "}
              <span className="text-gray-900 font-bold">
                {selectedConversation.fullName}
              </span>
              <div className="text-sm text-gray-800">
                {isOnline ? (
                  <p className="text-green-600 font-semibold">🟢 Online</p>
                ) : selectedConversation.lastSeen ? (
                  <p>
                    Last seen:{" "}
                    {new Date(selectedConversation.lastSeen).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-gray-500">Last seen unknown</p>
                )}
              </div>
            </div>

            {/* Call Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAudioCall}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-md transition"
                title="Start Audio Call"
              >
                <IoCall size={22} />
              </button>

              <button
                onClick={handleVideoCall}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-md transition"
                title="Start Video Call"
              >
                <IoVideocam size={22} />
              </button>
            </div>
          </div>

          <Messages />
          <MessageInput />
        </>
      )}

      {/* Call modal/UI */}
      <CallModal
        incomingCall={incomingCall}
        isCalling={isCalling}
        callActive={callActive}
        startCallHandler={startCall}
        acceptCallHandler={acceptCall}
        rejectCallHandler={rejectCall}
        endCallHandler={endCall}
        localStream={localStream}
        remoteStreamRef={{ current: remoteStream }}
        muted={muted}
        videoEnabled={videoEnabled}
        muteToggle={muteToggle}
        videoToggle={videoToggle}
        calleeName={selectedConversation?.fullName}
      />
    </div>
  );
};

export default MessageContainer;

const NoChatSelected = () => {
  const { authUser } = useAuthContext();
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2">
        <p>Welcome 👋 {authUser.fullName} ❄</p>
        <p className="text-gray-300">Select a chat to start messaging</p>
        <TiMessages className="text-3xl md:text-6xl text-center" />
      </div>
    </div>
  );
};
