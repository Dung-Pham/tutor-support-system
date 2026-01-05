/**
 * File: server.ts
 * Entry point - khoi dong server
 * Merged from HEAD, dang and quynh branches
 */

// Load environment variables FIRST
import 'dotenv/config';

import http from 'http';
import app from './app.js';
import connectMongoDB from './config/mongodb.js';
import { connectSQLServer } from './config/sqlserver.js';
import { initSocket } from './config/socket.js';
import socketEmitter from './utils/socketEmitter.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO with authentication
const io = initSocket(server);

// Initialize SocketEmitter with IO instance
socketEmitter.setIO(io);

// Expose Socket.IO instance for routes to use
app.set('io', io);

// Global status for database connections (from quynh)
declare global {
  var mongoConnectionStatus: string;
  var dbConnectionStatus: string;
}

/**
 * Start server function
 * - Connect to databases
 * - Start HTTP server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect MongoDB
    console.log('Connecting to MongoDB...');
    await connectMongoDB();
    global.mongoConnectionStatus = 'connected';

    // Connect SQL Server
    console.log('Connecting to SQL Server...');
    await connectSQLServer();
    global.dbConnectionStatus = 'connected';

    // Start server
    server.listen(PORT, () => {
      console.log('===============================================');
      console.log('TUTOR SUPPORT SYSTEM SERVER STARTED');
      console.log('===============================================');
      console.log('Server running on port ' + PORT);
      console.log('API Documentation: http://localhost:' + PORT + '/api-docs');
      console.log('Health check: http://localhost:' + PORT + '/health');
      console.log('Socket.IO ready for connections');
      console.log('===============================================');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Available API Routes:');
        console.log('  Auth: /api/auth/*');
        console.log('  Users: /api/users/*');
        console.log('  Classes: /api/classes/*');
        console.log('  Students: /api/students/*, /api/student/*');
        console.log('  Tutors: /api/tutors/*, /api/tutor/*');
        console.log('  Applications: /api/applications/*');
        console.log('  Notifications: /api/notifications/*');
        console.log('  Messages: /api/messages/*');
        console.log('  Conversations: /api/conversations/*');
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.warn('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });

    // Handle unhandled promise rejection
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      console.error('Unhandled Rejection', { promise, reason });
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions (from quynh)
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      console.log('Server will restart...');
      process.exit(1);
    });
  } catch (error) {
    const err = error as Error;
    console.error('Failed to start server: ' + err.message);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
