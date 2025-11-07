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

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // join room
  socket.on("join-room", ({ conversationId, userId }) => {
    socket.join(conversationId);
    socket.data.userId = userId;
    console.log(`Socket ${socket.id} joined room ${conversationId}`);
  });

  // Call user (audio/video)
  socket.on("call-user", ({ conversationId, from, fromName, to, callType }) => {
    socket
      .to(conversationId)
      .emit("incoming-call", { from, fromName, callType });
  });

  // WebRTC signaling
  socket.on("offer", ({ conversationId, from, fromName, sdp }) => {
    socket.to(conversationId).emit("offer", { from, fromName, sdp });
  });

  socket.on("answer", ({ conversationId, from, sdp }) => {
    socket.to(conversationId).emit("answer", { from, sdp });
  });

  socket.on("ice-candidate", ({ conversationId, from, candidate }) => {
    socket.to(conversationId).emit("ice-candidate", { from, candidate });
  });

  // End call
  socket.on("end-call", ({ conversationId, from }) => {
    socket.to(conversationId).emit("end-call", { from });
  });

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    try {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    } catch (error) {
      console.error("Error updating user last seen:", error);
    }
  });
});

export { app, io, server };


