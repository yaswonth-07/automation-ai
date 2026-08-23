import { ExecutionLog } from '../models/ExecutionLog.js';
import { emitExecutionEvent } from '../config/socket.js';

/**
 * Monitoring Agent: Observes execution progress, records granular ExecutionLog documents,
 * and broadcasts real-time timeline events over Socket.IO.
 */
export class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  async emitEvent({ executionId, workflowId, nodeId = null, agent, level = 'info', message, metadata = {} }) {
    // 1. Persist to MongoDB ExecutionLog collection
    let logDoc = null;
    try {
      logDoc = await ExecutionLog.create({
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
      });
    } catch (err) {
      console.warn('[MonitoringAgent] Failed to write ExecutionLog to DB:', err.message);
    }

    const payload = {
      id: logDoc?._id || `log_${Date.now()}`,
      executionId: String(executionId),
      workflowId: String(workflowId),
      nodeId,
      agent,
      level,
      message,
      metadata,
      createdAt: logDoc?.createdAt || new Date().toISOString(),
    };

    // 2. Stream event over WebSocket to all subscribed clients
    emitExecutionEvent(String(executionId), payload);

    return payload;
  }
}

export const monitoringAgent = new MonitoringAgent();
