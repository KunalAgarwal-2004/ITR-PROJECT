import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

/**
 * Main Server Entry Point
 */
const startServer = async () => {
  // Connect to MongoDB Atlas or local MongoDB
  try {
    const dbConn = await connectDB();
    if (!dbConn) {
      console.warn('[Server Startup Warning] Database is currently offline. API is running in degraded mode.');
      console.warn('[Server Startup Warning] Check your Atlas Network Access (IP Whitelist) to establish connection.');
    }
  } catch (err) {
    console.error(`[Server Startup Warning] Database connection error: ${err.message}`);
  }

  // Start HTTP Server
  const server = app.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  WorkBridge API Server running in [${ENV.NODE_ENV}] mode`);
    console.log(`  Port:         http://localhost:${ENV.PORT}`);
    console.log(`  Health Check: http://localhost:${ENV.PORT}/api/health`);
    console.log(`  Client URL:   ${ENV.CLIENT_URL}`);
    console.log(`=======================================================`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    console.error('[Fatal Error] Unhandled Promise Rejection:', err);
    // In production, give server time to finish active requests before exiting
    if (ENV.NODE_ENV === 'production') {
      server.close(() => process.exit(1));
    }
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err) => {
    console.error('[Fatal Error] Uncaught Exception:', err);
    process.exit(1);
  });

  // Graceful Shutdown on Termination Signals
  const handleShutdown = (signal) => {
    console.log(`\n[Server] ${signal} signal received: closing HTTP server gracefully...`);
    server.close(() => {
      console.log('[Server] HTTP connections closed. Process terminating cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
