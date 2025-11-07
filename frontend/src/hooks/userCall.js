// // src/hooks/useCall.js
// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER_URL = "https://chat-994b.onrender.com";
// // const SIGNALING_SERVER_URL = "https://chat-994b.onrender.com";

// const ICE_SERVERS = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     {
//       urls: "turn:relay1.expressturn.com:3478",
//       username: "efree",
//       credential: "efree123"
//     }
//     // add TURN server for production
//   ],
// };

// export default function useCall({
//   conversationId,
//   localUserId,
//   localUserName,
// }) {
//   const socketRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const remoteStreamRef = useRef(null);

//   const [isCalling, setIsCalling] = useState(false);
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [callActive, setCallActive] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoEnabled, setVideoEnabled] = useState(true);
//   const [pendingOffer, setPendingOffer] = useState(null);
//   const [callType, setCallType] = useState("audio"); // audio or video

//   useEffect(() => {
//     // socketRef.current = io(SIGNALING_SERVER_URL);
//     // initialize socket connection
//     socketRef.current = io(SIGNALING_SERVER_URL, {
//       transports: ["websocket"],
//       secure: true, // ensure HTTPS
//       rejectUnauthorized: false, // needed if using self-signed certificate
//     });

//     const socket = socketRef.current;

//     socket.on("connect", () => {
//       socket.emit("join-room", { conversationId, userId: localUserId });
//     });

//     socket.on("incoming-call", ({ from, type }) => {
//       setIncomingCall({ from, type });
//       setCallType(type);
//     });

//     socket.on("offer", ({ from, sdp, type }) => {
//       setIncomingCall({ from, type });
//       setCallType(type);
//       setPendingOffer({ from, sdp, type });
//     });

//     socket.on("answer", async ({ sdp }) => {
//       if (!pcRef.current) return;
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//       setCallActive(true);
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       if (candidate && pcRef.current) {
//         try {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (err) {
//           console.warn("Error adding received ICE candidate", err);
//         }
//       }
//     });

//     socket.on("end-call", () => closeCall());

//     return () => {
//       if (socketRef.current) socketRef.current.disconnect();
//       cleanupMedia();
//     };
//   }, [conversationId, localUserId]);

//   const ensurePeerConnection = async (type = "audio") => {
//     if (pcRef.current) return pcRef.current;

//     pcRef.current = new RTCPeerConnection(ICE_SERVERS);
//     remoteStreamRef.current = new MediaStream();

//     pcRef.current.ontrack = (event) => {
//       event.streams[0]
//         ?.getTracks()
//         .forEach((track) => remoteStreamRef.current.addTrack(track));
//     };

//     pcRef.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current.emit("ice-candidate", {
//           conversationId,
//           from: localUserId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     // get local media
//     try {
//       const constraints = {
//         audio: true,
//         video: type === "video",
//       };
//       const localStream = await navigator.mediaDevices.getUserMedia(
//         constraints
//       );
//       localStreamRef.current = localStream;

//       localStream.getTracks().forEach((track) => {
//         pcRef.current.addTrack(track, localStream);
//       });

//       setVideoEnabled(type === "video");
//     } catch (err) {
//       console.error("Failed to get local media", err);
//       throw err;
//     }

//     return pcRef.current;
//   };

//   const startCall = async (toUserId, options = { type: "audio" }) => {
//     setCallType(options.type);
//     await ensurePeerConnection(options.type);

//     // notify callee
//     socketRef.current.emit("call-user", {
//       conversationId,
//       from: localUserId,
//       to: toUserId,
//       type: options.type,
//     });

//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);

//     socketRef.current.emit("offer", {
//       conversationId,
//       from: localUserId,
//       fromName: localUserName,
//       to: toUserId,
//       sdp: pcRef.current.localDescription,
//       type: options.type,
//     });

//     setIsCalling(true);
//   };

//   const acceptCall = async () => {
//     if (!pendingOffer) return;
//     const { from, sdp, type } = pendingOffer;

//     setCallType(type);
//     await ensurePeerConnection(type);
//     await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

//     const answer = await pcRef.current.createAnswer();
//     await pcRef.current.setLocalDescription(answer);

//     socketRef.current.emit("answer", {
//       conversationId,
//       from: localUserId,
//       to: from,
//       sdp: pcRef.current.localDescription,
//     });

//     setIncomingCall(null);
//     setPendingOffer(null);
//     setCallActive(true);
//   };

//   const rejectCall = () => {
//     socketRef.current.emit("end-call", { conversationId, from: localUserId });
//     setIncomingCall(null);
//     setPendingOffer(null);
//   };

//   const endCall = () => {
//     socketRef.current.emit("end-call", { conversationId, from: localUserId });
//     closeCall();
//   };

//   const muteToggle = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current
//       .getAudioTracks()
//       .forEach((t) => (t.enabled = !t.enabled));
//     setMuted((m) => !m);
//   };

//   const videoToggle = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current
//       .getVideoTracks()
//       .forEach((t) => (t.enabled = !t.enabled));
//     setVideoEnabled((v) => !v);
//   };

//   const closeCall = () => {
//     setCallActive(false);
//     setIsCalling(false);
//     setIncomingCall(null);

//     if (pcRef.current) {
//       try {
//         pcRef.current.getSenders().forEach((s) => s.track?.stop());
//         pcRef.current.close();
//       } catch (e) {}
//       pcRef.current = null;
//     }

//     cleanupMedia();
//   };

//   const cleanupMedia = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//       localStreamRef.current = null;
//     }
//     if (remoteStreamRef.current) {
//       remoteStreamRef.current.getTracks().forEach((t) => t.stop());
//       remoteStreamRef.current = null;
//     }
//   };

//   return {
//     socket: socketRef.current,
//     startCall,
//     acceptCall,
//     rejectCall,
//     endCall,
//     muteToggle,
//     videoToggle,
//     isCalling,
//     incomingCall,
//     callActive,
//     localStream: localStreamRef.current,
//     remoteStream: remoteStreamRef.current,
//     muted,
//     videoEnabled,
//     callType,
//   };
// }






import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SIGNALING_SERVER_URL = "https://chat-994b.onrender.com";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:relay1.expressturn.com:3478",
      username: "efree",
      credential: "efree123",
    },
  ],
};

export default function useCall({ localUserId, localUserName }) {
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());

  const [incomingCall, setIncomingCall] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [pendingOffer, setPendingOffer] = useState(null);
  const [callType, setCallType] = useState("audio");
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // ✅ Connect socket with userId
  useEffect(() => {
    if (!localUserId) return;
    socketRef.current = io(SIGNALING_SERVER_URL, {
      query: { userId: localUserId },
      transports: ["websocket"],
      secure: true,
      rejectUnauthorized: false,
    });

    const socket = socketRef.current;

    socket.on("connect", () => console.log("🔗 Socket connected"));

    socket.on("incoming-call", ({ from, fromName, callType }) => {
      console.log("📩 Incoming call from", from);
      setIncomingCall({ from, fromName, callType });
      setCallType(callType);
    });

    socket.on("offer", async ({ from, sdp, callType }) => {
      setPendingOffer({ from, sdp, callType });
      setIncomingCall({ from, callType });
      setCallType(callType);
    });

    socket.on("answer", async ({ sdp }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        setCallActive(true);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pcRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("end-call", () => closeCall());

    return () => {
      socket.disconnect();
      cleanupMedia();
    };
  }, [localUserId]);

  // 🧩 Create Peer
  const ensurePeerConnection = async (type = "audio") => {
    if (pcRef.current) return pcRef.current;

    pcRef.current = new RTCPeerConnection(ICE_SERVERS);

    pcRef.current.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((t) => remoteStreamRef.current.addTrack(t));
    };

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate && incomingCall?.from) {
        socketRef.current.emit("ice-candidate", {
          from: localUserId,
          to: incomingCall.from,
          candidate: e.candidate,
        });
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      localStreamRef.current = stream;
      stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));
    } catch (err) {
      console.error("Media error:", err);
    }

    return pcRef.current;
  };

  // 📞 Start call
  const startCall = async (toUserId, options = { type: "audio" }) => {
    if (!toUserId) return console.warn("No user to call");

    await ensurePeerConnection(options.type);
    setIsCalling(true);

    socketRef.current.emit("call-user", {
      from: localUserId,
      fromName: localUserName,
      to: toUserId,
      callType: options.type,
    });

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    socketRef.current.emit("offer", {
      from: localUserId,
      to: toUserId,
      sdp: pcRef.current.localDescription,
      callType: options.type,
    });
  };

  // ✅ Accept
  const acceptCall = async () => {
    if (!pendingOffer) return;
    const { from, sdp, callType } = pendingOffer;

    await ensurePeerConnection(callType);
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socketRef.current.emit("answer", {
      from: localUserId,
      to: from,
      sdp: pcRef.current.localDescription,
    });

    setIncomingCall(null);
    setPendingOffer(null);
    setCallActive(true);
  };

  // ❌ Reject or End
  const rejectCall = () => {
    if (incomingCall?.from)
      socketRef.current.emit("end-call", {
        from: localUserId,
        to: incomingCall.from,
      });
    closeCall();
  };

  const endCall = () => {
    if (incomingCall?.from)
      socketRef.current.emit("end-call", {
        from: localUserId,
        to: incomingCall.from,
      });
    closeCall();
  };

  const muteToggle = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  };

  const videoToggle = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setVideoEnabled((v) => !v);
  };

  const closeCall = () => {
    setCallActive(false);
    setIsCalling(false);
    setIncomingCall(null);
    setPendingOffer(null);
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    cleanupMedia();
  };

  const cleanupMedia = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
  };

  return {
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    incomingCall,
    isCalling,
    callActive,
    localStream: localStreamRef.current,
    remoteStreamRef,
    muted,
    videoEnabled,
    muteToggle,
    videoToggle,
  };
}
