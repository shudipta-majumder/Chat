import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const FRONTEND_ORIGIN = process.env.frontend_url || process.env.production_url;

const allowedOrigins = [
  "http://localhost:3000",
  "https://chat-994b.onrender.com",
];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // if client passed userId via query params
  const userId = socket.handshake.query?.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // broadcast current online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // join room
  socket.on("join-room", ({ conversationId, userId: joiningUserId }) => {
    socket.join(conversationId);
    socket.data.userId = joiningUserId; // store on socket instance
    console.log(`Socket ${socket.id} joined room ${conversationId} as user ${joiningUserId}`);
  });

  // Call user (audio/video) - NOTE: we use `type` consistently
  socket.on("call-user", ({ conversationId, from, fromName, to, type }) => {
    // emit to everyone in the conversation except the sender
    socket.to(conversationId).emit("incoming-call", { from, fromName, type });
  });

  // WebRTC signaling - include `type` where appropriate
  socket.on("offer", ({ conversationId, from, fromName, sdp, type }) => {
    socket.to(conversationId).emit("offer", { from, fromName, sdp, type });
  });

  socket.on("answer", ({ conversationId, from, fromName, sdp, type }) => {
    socket.to(conversationId).emit("answer", { from, fromName, sdp, type });
  });

  socket.on("ice-candidate", ({ conversationId, from, candidate }) => {
    socket.to(conversationId).emit("ice-candidate", { from, candidate });
  });

  // End call
  socket.on("end-call", ({ conversationId, from }) => {
    socket.to(conversationId).emit("end-call", { from });
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id);
    // prefer socket.data.userId because it was set on join
    const sidUserId = socket.data?.userId || userId;
    if (sidUserId) delete userSocketMap[sidUserId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    try {
      if (sidUserId) await User.findByIdAndUpdate(sidUserId, { lastSeen: new Date() });
    } catch (error) {
      console.error("Error updating user last seen:", error);
    }
  });
});

export { app, io, server };