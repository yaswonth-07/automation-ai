import { executionService } from '../services/executionService.js';

export class ExecutionController {
  async listExecutions(req, res, next) {
    try {
      const { workflowId, status, page, limit } = req.query;
      const result = await executionService.listExecutions(req.user.id, { workflowId, status, page, limit });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getExecution(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: execution });
    } catch (err) {
      next(err);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const logs = await executionService.getTimeline(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }

  async pauseExecution(req, res, next) {
    try {
      const result = await executionService.pauseExecution(req.params.id, req.user.id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async resumeExecution(req, res, next) {
    try {
      const result = await executionService.resumeExecution(req.params.id, req.user.id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async cancelExecution(req, res, next) {
    try {
      const result = await executionService.cancelExecution(req.params.id, req.user.id);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}

export const executionController = new ExecutionController();
