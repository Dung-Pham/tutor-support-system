/**
 * File: server.ts
 * Mục đích: Entry point - khởi động server
 * Merged from HEAD and dang branches
 */

// Load environment variables FIRST - this import MUST be first
import 'dotenv/config';

import http from 'http';
import app from './app.js';
import connectMongoDB from './config/mongodb.js';
import { connectSQLServer } from './config/sqlserver.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO from dang branch (with authentication)
const io = initSocket(server);

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

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log('Socket.IO ready for connections');
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
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
