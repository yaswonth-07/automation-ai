import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { ENV } from '../config/env.js';
import { orchestrator } from '../agents/orchestrator.js';

let executionQueue = null;
let isRedisAvailable = false;

// Async in-memory queue fallback
const inMemoryQueue = [];
let isProcessingMemoryQueue = false;

async function processMemoryQueue() {
  if (isProcessingMemoryQueue || inMemoryQueue.length === 0) return;
  isProcessingMemoryQueue = true;

  while (inMemoryQueue.length > 0) {
    const job = inMemoryQueue.shift();
    try {
      console.log(`[Queue:InMemory] Processing execution job ${job.executionId}`);
      await orchestrator.run(job.executionId);
    } catch (err) {
      console.error(`[Queue:InMemory] Execution ${job.executionId} failed:`, err.message);
    }
  }

  isProcessingMemoryQueue = false;
}

export function initQueue() {
  try {
    const redisConnection = new IORedis({
      host: ENV.REDIS_HOST,
      port: ENV.REDIS_PORT,
      password: ENV.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 2000,
      retryStrategy: () => null, // Do not spam retries if Redis is offline
    });

    redisConnection.on('connect', () => {
      console.log(`[Queue] Connected to Redis at ${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`);
      isRedisAvailable = true;
    });

    redisConnection.on('error', (err) => {
      if (isRedisAvailable) {
        console.warn('[Queue] Redis connection lost, switching to in-memory queue:', err.message);
      }
      isRedisAvailable = false;
    });

    executionQueue = new Queue('workflow-executions', { connection: redisConnection });

    new Worker(
      'workflow-executions',
      async (job) => {
        console.log(`[Queue:BullMQ] Worker picked up job ${job.id} for execution ${job.data.executionId}`);
        await orchestrator.run(job.data.executionId);
      },
      { connection: redisConnection }
    );
  } catch (err) {
    console.log('[Queue] Redis unavailable. Running in robust in-memory background queue mode.');
    isRedisAvailable = false;
  }
}

export async function addExecutionJob(executionId) {
  if (isRedisAvailable && executionQueue) {
    try {
      const job = await executionQueue.add(
        'execute-workflow',
        { executionId: String(executionId) },
        { attempts: 1, removeOnComplete: true }
      );
      return { queueType: 'bullmq', jobId: job.id };
    } catch (err) {
      console.warn('[Queue] Failed to enqueue to BullMQ, falling back to in-memory:', err.message);
    }
  }

  // In-Memory Asynchronous Job
  inMemoryQueue.push({ executionId: String(executionId), queuedAt: Date.now() });
  setTimeout(() => processMemoryQueue(), 50);

  return { queueType: 'in-memory', queued: true };
}

export function getQueueStatus() {
  return {
    engine: isRedisAvailable ? 'BullMQ (Redis)' : 'In-Memory Async Queue',
    isRedisAvailable,
    pendingInMemoryJobs: inMemoryQueue.length,
  };
}
