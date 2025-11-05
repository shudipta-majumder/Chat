// src/hooks/useCall.js
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// adjust to your backend url
const SIGNALING_SERVER_URL = "https://chat-994b.onrender.com";

// STUN/TURN config - set TURN in production
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // add TURN server here for production
  ],
};

export default function useCall({ conversationId, localUserId, localUserName  }) {
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); // { from }
  const [callActive, setCallActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [pendingOffer, setPendingOffer] = useState(null);

  useEffect(() => {
    socketRef.current = io(SIGNALING_SERVER_URL);
    const socket = socketRef.current;

    socket.on("connect", () => {
      // Join conversation room so signaling stays scoped
      socket.emit("join-room", { conversationId, userId: localUserId });
    });

    socket.on("incoming-call", ({ from }) => {
      setIncomingCall({ from });
    });

    socket.on("offer", async ({ from, sdp }) => {
      // store the offer and caller info
      setIncomingCall({ from });
      setPendingOffer({ from, sdp });
    });

    socket.on("incoming-call", ({ from }) => {
      setIncomingCall({ from });
    });

    socket.on("answer", async ({ from, sdp }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      setCallActive(true);
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      if (candidate && pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Error adding received ICE candidate", err);
        }
      }
    });

    socket.on("end-call", ({ from }) => {
      closeCall();
    });

    return () => {
      // cleanup socket on unmount or conversation change
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      cleanupMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, localUserId]);

  const ensurePeerConnection = async () => {
    if (pcRef.current) return pcRef.current;

    pcRef.current = new RTCPeerConnection(ICE_SERVERS);

    // create remote stream container
    remoteStreamRef.current = new MediaStream();

    pcRef.current.ontrack = (event) => {
      // attach tracks to remote stream
      event.streams?.[0]?.getTracks().forEach((t) => {
        remoteStreamRef.current.addTrack(t);
      });
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          conversationId,
          from: localUserId,
          candidate: event.candidate,
        });
      }
    };

    // get local audio
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStreamRef.current = localStream;
      localStream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, localStream);
      });
    } catch (err) {
      console.error("Failed to get local media", err);
      throw err;
    }

    return pcRef.current;
  };

  const startCall = async (toUserId) => {
    await ensurePeerConnection();

    // 🔔 Notify the callee about the incoming call
    socketRef.current.emit("call-user", {
      conversationId,
      from: localUserId,
      to: toUserId,
    });

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    // send the SDP offer after the popup notification
    socketRef.current.emit("offer", {
      conversationId,
      from: localUserId,
      fromName: localUserName,
      to: toUserId,
      sdp: pcRef.current.localDescription,
    });

    setIsCalling(true);
  };

  const acceptCall = async () => {
    if (!pendingOffer) return;
    const { from, sdp } = pendingOffer;

    await ensurePeerConnection(); // now we get mic and PC
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socketRef.current.emit("answer", {
      conversationId,
      from: localUserId,
      to: from,
      sdp: pcRef.current.localDescription,
    });

    setIncomingCall(null);
    setPendingOffer(null);
    setCallActive(true);
  };

  const rejectCall = () => {
    socketRef.current.emit("end-call", { conversationId, from: localUserId });
    setIncomingCall(null);
    setPendingOffer(null);
  };

  const endCall = () => {
    socketRef.current.emit("end-call", { conversationId, from: localUserId });
    closeCall();
  };

  const muteToggle = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getAudioTracks()
      .forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  };

  const closeCall = () => {
    setCallActive(false);
    setIsCalling(false);
    setIncomingCall(null);

    // Close PC
    if (pcRef.current) {
      try {
        pcRef.current.getSenders().forEach((s) => {
          if (s.track) s.track.stop();
        });
        pcRef.current.close();
      } catch (e) {}
      pcRef.current = null;
    }
    cleanupMedia();
  };

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
  };

  return {
    socket: socketRef.current,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    muteToggle,
    isCalling,
    incomingCall,
    callActive,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    muted,
  };
}
