import { Server } from 'socket.io';
import { ENV } from './env.js';

let ioInstance = null;

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: [ENV.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join execution-specific room for real-time streaming
    socket.on('join:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined execution:${executionId}`);
      }
    });

    // Leave execution room
    socket.on('leave:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
        console.log(`[Socket.IO] Socket ${socket.id} left execution:${executionId}`);
      }
    });

    // Join user notifications room
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

/**
 * Emit an agent timeline event for an active execution
 */
export function emitExecutionEvent(executionId, eventData) {
  if (ioInstance && executionId) {
    ioInstance.to(`execution:${executionId}`).emit('execution:event', {
      executionId,
      timestamp: new Date().toISOString(),
      ...eventData
    });
    // Also broadcast globally for dashboard live feed
    ioInstance.emit('dashboard:feed', {
      executionId,
      timestamp: new Date().toISOString(),
      ...eventData
    });
  }
}

/**
 * Emit a notification to a specific user
 */
export function emitUserNotification(userId, notification) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit('notification:new', notification);
    ioInstance.emit('notification:global', notification);
  }
}
