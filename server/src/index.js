import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import { ENV } from './config/env.js';
import { connectDB, getDBStatus } from './config/db.js';
import { initSocket } from './config/socket.js';
import { initQueue, getQueueStatus } from './queues/executionQueue.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Security & Core Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiter
app.use('/api/', apiRateLimiter);

// Health & System Heartbeat endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Agentflow_AI Backend',
    timestamp: new Date().toISOString(),
    database: getDBStatus(),
    queue: getQueueStatus(),
    environment: ENV.NODE_ENV,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch 404 for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.originalUrl}`, code: 'NOT_FOUND' });
});

// Centralized Error Handler
app.use(errorHandler);

// Bootstrap Server
async function startServer() {
  await connectDB();
  initQueue();

  server.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Agentflow_AI Server listening on port ${ENV.PORT}`);
    console.log(`🌐 Health check available at: http://localhost:${ENV.PORT}/api/health`);
    console.log(`🔌 WebSocket Server active with real-time room streaming`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});

export { app, server };
