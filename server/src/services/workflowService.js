import { Workflow } from '../models/Workflow.js';
import { Execution } from '../models/Execution.js';
import { AppError } from '../middleware/errorHandler.js';

export class WorkflowService {
  async createWorkflow(userId, data) {
    const { name, description = '', nodes = [], edges = [], triggerConfig = { type: 'manual' }, tags = [] } = data;
    
    if (!name) {
      throw new AppError('Workflow name is required', 400, 'INVALID_INPUT');
    }

    const workflow = await Workflow.create({
      name,
      description,
      owner: userId,
      nodes,
      edges,
      triggerConfig,
      tags,
      status: 'draft',
      version: 1,
    });

    return workflow;
  }

  async listWorkflows(userId, { search = '', tag = '', status = '', page = 1, limit = 20 } = {}) {
    const query = { owner: userId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (tag) query.tags = tag;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [workflows, total] = await Promise.all([
      Workflow.find(query).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Workflow.countDocuments(query),
    ]);

    return {
      workflows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getWorkflowById(workflowId, userId) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      throw new AppError('Workflow not found', 404, 'NOT_FOUND');
    }
    return workflow;
  }

  async updateWorkflow(workflowId, userId, data) {
    const workflow = await this.getWorkflowById(workflowId, userId);

    if (data.name !== undefined) workflow.name = data.name;
    if (data.description !== undefined) workflow.description = data.description;
    if (data.nodes !== undefined) workflow.nodes = data.nodes;
    if (data.edges !== undefined) workflow.edges = data.edges;
    if (data.triggerConfig !== undefined) workflow.triggerConfig = data.triggerConfig;
    if (data.status !== undefined) workflow.status = data.status;
    if (data.tags !== undefined) workflow.tags = data.tags;

    workflow.version += 1;
    await workflow.save();

    return workflow;
  }

  async duplicateWorkflow(workflowId, userId) {
    const original = await this.getWorkflowById(workflowId, userId);
    
    const clone = await Workflow.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      owner: userId,
      status: 'draft',
      triggerConfig: original.triggerConfig,
      nodes: original.nodes,
      edges: original.edges,
      tags: original.tags,
      version: 1,
    });

    return clone;
  }

  async deleteWorkflow(workflowId, userId) {
    const workflow = await this.getWorkflowById(workflowId, userId);
    await Workflow.deleteOne({ _id: workflowId, owner: userId });
    return { success: true, message: 'Workflow deleted successfully' };
  }

  async getDashboardMetrics(userId) {
    const [totalWorkflows, activeWorkflows, executions, recentExecutions] = await Promise.all([
      Workflow.countDocuments({ owner: userId }),
      Workflow.countDocuments({ owner: userId, status: 'active' }),
      Execution.find({ owner: userId }),
      Execution.find({ owner: userId }).sort({ createdAt: -1 }).limit(8),
    ]);

    const totalRuns = executions.length;
    const successfulRuns = executions.filter((e) => e.status === 'COMPLETED').length;
    const failedRuns = executions.filter((e) => e.status === 'FAILED').length;
    const successRate = totalRuns > 0 ? Number(((successfulRuns / totalRuns) * 100).toFixed(1)) : 100;

    const avgDuration =
      executions.length > 0
        ? Math.round(executions.reduce((acc, e) => acc + (e.duration || 0), 0) / executions.length)
        : 0;

    return {
      totalWorkflows,
      activeWorkflows,
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate,
      avgDurationMs: avgDuration,
      recentExecutions,
    };
  }
}

export const workflowService = new WorkflowService();
