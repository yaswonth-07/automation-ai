import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to Agentflow real-time server with id:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected from server');
    });
  }

  return socket;
}

export function subscribeToExecution(executionId, onEvent) {
  const s = getSocket();
  if (!s || !executionId) return () => {};

  s.emit('join:execution', executionId);

  const handler = (data) => {
    if (data.executionId === executionId) {
      onEvent(data);
    }
  };

  s.on('execution:event', handler);

  return () => {
    s.emit('leave:execution', executionId);
    s.off('execution:event', handler);
  };
}

export function subscribeToNotifications(userId, onNotification) {
  const s = getSocket();
  if (!s) return () => {};

  if (userId) {
    s.emit('join:user', userId);
  }

  s.on('notification:new', onNotification);
  s.on('notification:global', onNotification);

  return () => {
    s.off('notification:new', onNotification);
    s.off('notification:global', onNotification);
  };
}
