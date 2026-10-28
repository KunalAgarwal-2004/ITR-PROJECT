import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';

/**
 * MongoDB Connection States in Mongoose:
 * 0: Disconnected
 * 1: Connected
 * 2: Connecting
 * 3: Disconnecting
 */
const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

/**
 * Safely obfuscates credentials in MongoDB URI for logging
 */
export const sanitizeMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/\/\/(.*?):(.*?)@/, '//$1:****@');
};

/**
 * Checks and formats the MongoDB URI, handling missing DB name or special chars
 */
const formatMongoUri = (rawUri) => {
  let uri = rawUri.trim();

  // If URI ends with / or has no database name specified before query string, add freelance_marketplace
  if (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) {
    const hasDbName = /^mongodb(?:\+srv)?:\/\/[^\/]+\/([a-zA-Z0-9_\-]+)(?:\?.*)?$/.test(uri);
    if (!hasDbName) {
      if (uri.includes('?')) {
        uri = uri.replace('?', '/freelance_marketplace?');
      } else if (uri.endsWith('/')) {
        uri = `${uri}freelance_marketplace?retryWrites=true&w=majority`;
      } else {
        uri = `${uri}/freelance_marketplace?retryWrites=true&w=majority`;
      }
    }
  }

  return uri;
};

/**
 * Configure DNS resolver for SRV lookups on restrictive networks
 */
const configureDNS = (uri) => {
  if (uri && uri.startsWith('mongodb+srv://')) {
    try {
      // Use reliable public resolvers (Google & Cloudflare) for SRV queries
      // to bypass local ISP/campus DNS proxies that reject SRV lookups
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch (dnsErr) {
      // Graceful fallback if setServers is restricted
    }
  }
};

/**
 * Establishes connection to MongoDB Atlas or local MongoDB instance.
 * Gracefully handles connection failures with descriptive diagnostic guidance.
 */
export const connectDB = async () => {
  const rawUri = ENV.MONGODB_URI || process.env.MONGO_URI;

  if (!rawUri) {
    console.error('[MongoDB Error] MONGODB_URI (or MONGO_URI) is not defined in environment variables.');
    return null;
  }

  const uri = formatMongoUri(rawUri);
  const sanitizedUri = sanitizeMongoUri(uri);

  // Apply resilient DNS for SRV queries
  configureDNS(uri);

  const mongooseOptions = {
    serverSelectionTimeoutMS: 8000, // 8s timeout for cluster election & server selection
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Prefer IPv4 to avoid IPv6 routing delays
    autoIndex: ENV.NODE_ENV !== 'production'
  };

  try {
    console.log(`[MongoDB] Initiating connection to: ${sanitizedUri}`);

    const conn = await mongoose.connect(uri, mongooseOptions);

    console.log(`[MongoDB] Connected successfully! Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Failed]: ${error.message}`);

    // Contextual Diagnostic Guidance
    const msg = error.message || '';

    if (msg.includes('querySrv ECONNREFUSED') || msg.includes('querySrv ETIMEOUT')) {
      const match = uri.match(/@([^\/\?]+)/);
      const host = match ? match[1] : 'cluster0.0i5fzj4.mongodb.net';

      console.error('\n--- [MongoDB Diagnostic: DNS SRV Lookup Failure] ---');
      console.error(`1. Your local network/ISP DNS rejected the SRV record query for: _mongodb._tcp.${host}`);
      console.error('2. You can verify this in PowerShell or Command Prompt with:');
      console.error(`   nslookup -type=SRV _mongodb._tcp.${host}`);
      console.error('3. Alternative solution: Use the standard (non-SRV) replica set connection string from MongoDB Atlas.');
      console.error('---------------------------------------------------\n');
    } else if (
      msg.includes('SSL alert number 80') ||
      msg.includes('tlsv1 alert internal error') ||
      msg.includes('Could not connect to any servers in your MongoDB Atlas cluster') ||
      msg.includes('IP that isn\'t whitelisted') ||
      msg.includes('Server selection timed out')
    ) {
      console.error('\n--- [MongoDB Diagnostic: Atlas IP Access List / Whitelist Required] ---');
      console.error('MongoDB Atlas rejected the connection. This occurs when your current public IP');
      console.error('is not added to your MongoDB Atlas Network Access whitelist.');
      console.error('\nAction Required in MongoDB Atlas:');
      console.error('1. Log in to https://cloud.mongodb.com/');
      console.error('2. Go to "Security" -> "Network Access" in the left sidebar.');
      console.error('3. Click "Add IP Address".');
      console.error('4. Choose "Add Current IP Address", or enter "0.0.0.0/0" (Allow Access from Anywhere) for development.');
      console.error('5. Wait ~1 minute for Atlas to deploy the rule, then restart the server.');
      console.error('------------------------------------------------------------------------\n');
    } else if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
      console.error('\n--- [MongoDB Diagnostic: Authentication Failed] ---');
      console.error('1. Verify your database username and password in server/.env.');
      console.error('2. Ensure user exists under "Database Access" in MongoDB Atlas.');
      console.error('3. If password contains special characters, ensure it is properly URL-encoded.');
      console.error('---------------------------------------------------\n');
    }

    // If Atlas connection fails in development, fallback gracefully to local MongoDB
    if (ENV.NODE_ENV !== 'production' && uri.startsWith('mongodb+srv://')) {
      const localUri = 'mongodb://127.0.0.1:27017/freelance_marketplace';
      console.warn(`\n[MongoDB] Atlas unavailable (IP whitelist or network). Attempting local fallback: ${localUri}`);
      try {
        const fallbackConn = await mongoose.connect(localUri, {
          ...mongooseOptions,
          serverSelectionTimeoutMS: 3000
        });
        console.log(`[MongoDB] Connected successfully via local instance! Database: ${fallbackConn.connection.name}`);
        return fallbackConn;
      } catch (fallbackErr) {
        console.error(`[MongoDB] Local fallback also failed: ${fallbackErr.message}`);
      }
    }

    if (ENV.NODE_ENV === 'production') {
      console.error('[MongoDB] Exiting process due to fatal DB connection failure in production.');
      process.exit(1);
    }

    return null;
  }
};

/**
 * Returns current database connection health telemetry
 */
export const getDBHealth = () => {
  const readyState = mongoose.connection.readyState;
  return {
    status: CONNECTION_STATES[readyState] || 'unknown',
    readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};

// Mongoose Connection Lifecycle Event Listeners
mongoose.connection.on('connected', () => {
  console.log('[MongoDB Event] Connection open');
});

mongoose.connection.on('error', (err) => {
  // Suppress verbose repeated TLS alert logs in console
  if (!err.message?.includes('SSL alert number 80')) {
    console.error(`[MongoDB Event] Runtime error: ${err.message}`);
  }
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Event] Connection lost / disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB Event] Connection re-established');
});

export default connectDB;
