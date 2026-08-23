import { Execution } from '../models/Execution.js';
import { ExecutionLog } from '../models/ExecutionLog.js';
import { Workflow } from '../models/Workflow.js';
import { addExecutionJob } from '../queues/executionQueue.js';
import { orchestrator } from '../agents/orchestrator.js';
import { AppError } from '../middleware/errorHandler.js';

export class ExecutionService {
  async triggerExecution(workflowId, userId, inputs = {}) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      throw new AppError('Workflow not found', 404, 'NOT_FOUND');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new AppError('Cannot execute an empty workflow with no nodes', 400, 'EMPTY_WORKFLOW');
    }

    // Capture immutable runtime snapshot
    const snapshot = {
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      triggerConfig: workflow.triggerConfig,
      version: workflow.version,
    };

    const execution = await Execution.create({
      workflowId: workflow._id,
      owner: userId,
      snapshot,
      status: 'PENDING',
      inputs,
      startTime: new Date(),
    });

    // Enqueue background job
    await addExecutionJob(execution._id);

    return execution;
  }

  async listExecutions(userId, { workflowId = '', status = '', page = 1, limit = 20 } = {}) {
    const query = { owner: userId };
    if (workflowId) query.workflowId = workflowId;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [executions, total] = await Promise.all([
      Execution.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Execution.countDocuments(query),
    ]);

    return {
      executions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getExecutionById(executionId, userId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId });
    if (!execution) {
      throw new AppError('Execution not found', 404, 'NOT_FOUND');
    }
    return execution;
  }

  async getTimeline(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    const logs = await ExecutionLog.find({ executionId: execution._id }).sort({ createdAt: 1 });
    return logs;
  }

  async pauseExecution(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    if (execution.status !== 'RUNNING') {
      throw new AppError(`Cannot pause an execution in ${execution.status} state`, 400, 'INVALID_STATE');
    }

    orchestrator.setSignal(executionId, 'PAUSE');
    execution.status = 'PAUSED';
    await execution.save();

    return { success: true, message: 'Execution pause requested', execution };
  }

  async resumeExecution(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    if (execution.status !== 'PAUSED') {
      throw new AppError(`Cannot resume an execution in ${execution.status} state`, 400, 'INVALID_STATE');
    }

    execution.status = 'PENDING';
    await execution.save();
    orchestrator.clearSignal(executionId);

    // Re-dispatch
    await addExecutionJob(execution._id);

    return { success: true, message: 'Execution resumed', execution };
  }

  async cancelExecution(executionId, userId) {
    const execution = await this.getExecutionById(executionId, userId);
    if (!['PENDING', 'RUNNING', 'PAUSED', 'RETRYING'].includes(execution.status)) {
      throw new AppError(`Cannot cancel an execution in ${execution.status} state`, 400, 'INVALID_STATE');
    }

    orchestrator.setSignal(executionId, 'CANCEL');
    execution.status = 'CANCELLED';
    execution.endTime = new Date();
    await execution.save();

    return { success: true, message: 'Execution cancelled', execution };
  }
}

export const executionService = new ExecutionService();
