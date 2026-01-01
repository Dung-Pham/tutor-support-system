/**
 * File: server.ts
 * Mục đích: Entry point - khởi động server
 * Merged from HEAD and dang branches
 */

// Load environment variables FIRST - this import MUST be first
import 'dotenv/config';

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import connectMongoDB from './config/mongodb.js';
import { connectSQLServer } from './config/sqlserver.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration (from HEAD)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO - Handle realtime connections (from HEAD)
io.on('connection', (socket) => {
  console.log( New client connected: ${socket.id});

  // Join room - Client joins a specific room
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log( Client ${socket.id} joined room: ${roomId});
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Leave room - Client leaves a room
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    console.log( Client ${socket.id} left room: ${roomId});
    socket.to(roomId).emit('user-left', socket.id);
  });

  // Chat message - Broadcast message in room
  socket.on('chat-message', ({ roomId, message }: { roomId: string; message: string }) => {
    io.to(roomId).emit('chat-message', {
      userId: socket.id,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // Notification - Send notification to specific user
  socket.on('send-notification', ({ userId, notification }: { userId: string; notification: any }) => {
    io.to(userId).emit('notification', notification);
  });

  // Disconnect - Handle client disconnect
  socket.on('disconnect', () => {
    console.log( Client disconnected: ${socket.id});
  });
});

// Expose Socket.IO instance for routes to use
app.set('io', io);

/**
 * Start server function
 * - Connect to databases
 * - Sync database models (development only)
 * - Start HTTP server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect MongoDB
    await connectMongoDB();

    // Connect SQL Server
    await connectSQLServer();

    // Initialize Socket.IO from dang branch (additional setup)
    initSocket(server);

    // Start server
    server.listen(PORT, () => {
      console.log( Server running on port ${PORT});
      console.log( API Documentation: http://localhost:${PORT}/api-docs);
      console.log( Health check: http://localhost:${PORT}/health);
      console.log( Socket.IO ready for connections);
    });

    // Graceful shutdown (from dang)
    process.on('SIGTERM', () => {
      console.warn(' SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log(' Process terminated');
      });
    });

    // Handle unhandled promise rejection (from both)
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      console.error(' Unhandled Rejection', { promise, reason });
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    const err = error as Error;
    console.error( Failed to start server: ${err.message});
    process.exit(1);
  }
};

startServer();
