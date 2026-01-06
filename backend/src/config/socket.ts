// Socket.IO Config

import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth.js";

// Use same JWT secret as authController
const JWT_SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || 'your-secret-key-change-in-production';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: Server | null = null;

const connectedUsers = new Map<string, string>();

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    try {
      const decoded = jwt.verify(
        token,
        JWT_SECRET
      ) as JwtPayload;
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.error("Socket auth error", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (!userId) return;

    console.log(`🔌 User connected: ${userId}`);

    connectedUsers.set(userId, socket.id);

    socket.emit("connected", { userId, socketId: socket.id });

    socket.emit("online_users", { users: Array.from(connectedUsers.keys()) });

    socket.broadcast.emit("user_online", { userId });

    // ✅ THÊM: Handler cho join_room event
    socket.on("join_room", (room: string) => {
      socket.join(room);
      console.log(`✅ User ${userId} joined room: ${room}`);
    });

    socket.on("join_conversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`👤 User ${userId} joined conversation: ${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`👤 User ${userId} left conversation: ${conversationId}`);
    });

    socket.on(
      "typing",
      ({
        conversationId,
        isTyping,
      }: {
        conversationId: string;
        isTyping: boolean;
      }) => {
        socket.to(conversationId).emit("user_typing", {
          userId,
          conversationId,
          isTyping,
        });
      }
    );

    socket.on(
      "message_seen",
      ({
        conversationId,
        messageId,
      }: {
        conversationId: string;
        messageId: string;
      }) => {
        socket.to(conversationId).emit("message_seen", {
          userId,
          conversationId,
          messageId,
        });
      }
    );

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${userId}`);
      connectedUsers.delete(userId);
      socket.broadcast.emit("user_offline", { userId });
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
}

export function emitToConversation(
  conversationId: string,
  event: string,
  data: unknown
): void {
  if (io) {
    io.to(conversationId).emit(event, data);
  }
}

export function isUserOnline(userId: string): boolean {
  return connectedUsers.has(userId);
}

export function getOnlineUsers(): string[] {
  return Array.from(connectedUsers.keys());
}
