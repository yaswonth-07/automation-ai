import { workflowService } from '../services/workflowService.js';
import { aiService } from '../services/aiService.js';
import { executionService } from '../services/executionService.js';

export class WorkflowController {
  async getDashboard(req, res, next) {
    try {
      const stats = await workflowService.getDashboardMetrics(req.user.id);
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  async listWorkflows(req, res, next) {
    try {
      const { search, tag, status, page, limit } = req.query;
      const result = await workflowService.listWorkflows(req.user.id, { search, tag, status, page, limit });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async createWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user.id, req.body);
      res.status(201).json({ success: true, data: workflow });
    } catch (err) {
      next(err);
    }
  }

  async generateWorkflow(req, res, next) {
    try {
      const { prompt } = req.body;
      const generated = await aiService.generateWorkflow(prompt);
      res.status(200).json({ success: true, data: generated });
    } catch (err) {
      next(err);
    }
  }

  async getWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: workflow });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.updateWorkflow(req.params.id, req.user.id, req.body);
      res.status(200).json({ success: true, data: workflow });
    } catch (err) {
      next(err);
    }
  }

  async duplicateWorkflow(req, res, next) {
    try {
      const clone = await workflowService.duplicateWorkflow(req.params.id, req.user.id);
      res.status(201).json({ success: true, data: clone });
    } catch (err) {
      next(err);
    }
  }

  async executeWorkflow(req, res, next) {
    try {
      const execution = await executionService.triggerExecution(req.params.id, req.user.id, req.body.inputs || {});
      res.status(200).json({ success: true, data: execution });
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkflow(req, res, next) {
    try {
      const result = await workflowService.deleteWorkflow(req.params.id, req.user.id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

export const workflowController = new WorkflowController();
