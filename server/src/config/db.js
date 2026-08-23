import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';

// Ensure SRV records resolve reliably across Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

let isConnected = false;
let isInMemory = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  try {
    mongoose.set('strictQuery', false);
    
    // Attempt standard connection with 3s timeout
    await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    
    isConnected = true;
    isInMemory = false;
    console.log(`[DB] Connected to MongoDB at ${ENV.MONGO_URI}`);
    return mongoose.connection;
  } catch (err) {
    console.warn(`[DB] Could not connect to MongoDB at ${ENV.MONGO_URI}: ${err.message}`);
    console.log('[DB] Attempting in-memory MongoDB fallback...');

    try {
      // Dynamic import of mongodb-memory-server if available
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      await mongoose.connect(uri);
      isConnected = true;
      isInMemory = true;
      console.log(`[DB] Connected to In-Memory MongoDB at ${uri}`);
      return mongoose.connection;
    } catch (memErr) {
      console.error('[DB] In-memory MongoDB failed:', memErr.message);
      console.log('[DB] Running in disconnected memory-simulation mode.');
      isConnected = false;
      isInMemory = true;
    }
  }
}

export function getDBStatus() {
  return {
    connected: isConnected || isInMemory,
    inMemory: isInMemory,
    host: isConnected ? (isInMemory ? 'in-memory-db' : mongoose.connection.host) : 'standalone-memory',
    readyState: mongoose.connection.readyState
  };
}
