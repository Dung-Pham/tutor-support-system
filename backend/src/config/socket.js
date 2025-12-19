import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

const connectedUsers = new Map();

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`🔌 User connected: ${userId}`);

    connectedUsers.set(userId, socket.id);

    socket.emit("connected", { userId, socketId: socket.id });

    // Send current online users list to the newly connected user
    socket.emit("online_users", { users: Array.from(connectedUsers.keys()) });

    // Broadcast to all other users that this user is online
    socket.broadcast.emit("user_online", { userId });

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`👤 User ${userId} joined conversation: ${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`👤 User ${userId} left conversation: ${conversationId}`);
    });

    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit("user_typing", {
        userId,
        conversationId,
        isTyping,
      });
    });

    socket.on("message_seen", ({ conversationId, messageId }) => {
      socket.to(conversationId).emit("message_seen", {
        userId,
        conversationId,
        messageId,
      });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${userId}`);
      connectedUsers.delete(userId);
      // Broadcast to all users that this user is offline
      socket.broadcast.emit("user_offline", { userId });
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function emitToUser(userId, event, data) {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
}

export function emitToConversation(conversationId, event, data) {
  if (io) {
    io.to(conversationId).emit(event, data);
  }
}

export { connectedUsers };
