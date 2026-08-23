import { plannerAgent } from './plannerAgent.js';
import { ExecutionAgent } from './executionAgent.js';
import { validationAgent } from './validationAgent.js';
import { recoveryAgent } from './recoveryAgent.js';
import { monitoringAgent } from './monitoringAgent.js';
import { integrationService } from '../services/integrationService.js';
import { notificationService } from '../services/notificationService.js';
import { Execution } from '../models/Execution.js';
import { AgentMemory } from '../models/AgentMemory.js';

// Execution control signal registry for pause/cancel
const activeControlSignals = new Map();

export class Orchestrator {
  constructor() {
    this.executionAgent = new ExecutionAgent(integrationService);
    this.langGraphStatus = 'not-installed';
    this.checkLangGraph();
  }

  async checkLangGraph() {
    try {
      await import('@langchain/langgraph');
      this.langGraphStatus = 'available';
    } catch {
      this.langGraphStatus = 'not-installed';
    }
  }

  setSignal(executionId, signal) {
    activeControlSignals.set(String(executionId), signal);
  }

  getSignal(executionId) {
    return activeControlSignals.get(String(executionId)) || null;
  }

  clearSignal(executionId) {
    activeControlSignals.delete(String(executionId));
  }

  async run(executionId) {
    const execDoc = await Execution.findById(executionId);
    if (!execDoc) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const workflow = execDoc.snapshot;
    const workflowId = execDoc.workflowId;
    const userId = execDoc.owner;
    const startTime = Date.now();

    execDoc.status = 'RUNNING';
    execDoc.startTime = new Date(startTime);
    await execDoc.save();

    await monitoringAgent.emitEvent({
      executionId,
      workflowId,
      agent: 'orchestrator',
      level: 'info',
      message: `Orchestrator initialized workflow execution run with substrate: ${this.langGraphStatus}`,
      metadata: { langGraph: this.langGraphStatus, totalNodes: workflow.nodes?.length || 0 },
    });

    // 1. Planner Agent Stage
    await monitoringAgent.emitEvent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'info',
      message: 'Planner Agent analyzing graph topology and computing topological execution DAG...',
    });

    const planResult = await plannerAgent.plan(workflow);
    if (!planResult.success) {
      execDoc.status = 'FAILED';
      execDoc.error = planResult.error;
      execDoc.endTime = new Date();
      execDoc.duration = Date.now() - startTime;
      await execDoc.save();

      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'error',
        message: `Planner Agent failed: ${planResult.error}`,
      });
      return execDoc;
    }

    // Persist planner memory
    try {
      await AgentMemory.create({
        workflowId,
        executionId,
        agentId: 'planner',
        key: 'execution_plan',
        value: planResult.executionPlan.map((n) => n.id),
        confidenceScore: planResult.confidenceScore,
      });
    } catch {}

    await monitoringAgent.emitEvent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'success',
      message: `Execution plan formulated: ${planResult.totalSteps} steps sequenced. Confidence score: ${(planResult.confidenceScore * 100).toFixed(0)}%`,
      metadata: { confidenceScore: planResult.confidenceScore, steps: planResult.executionPlan.map((n) => n.id) },
    });

    // 2. Step-by-Step Execution Chain
    const stepOutputs = {};
    const executionMemory = { executionId: String(executionId) };
    let failed = false;
    let failureReason = null;

    for (let i = 0; i < planResult.executionPlan.length; i++) {
      const node = planResult.executionPlan[i];
      const stepNumber = i + 1;

      // Check for pause/cancel control signals
      const signal = this.getSignal(executionId);
      if (signal === 'CANCEL') {
        execDoc.status = 'CANCELLED';
        execDoc.currentNode = node.id;
        execDoc.endTime = new Date();
        execDoc.duration = Date.now() - startTime;
        await execDoc.save();
        this.clearSignal(executionId);

        await monitoringAgent.emitEvent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'orchestrator',
          level: 'warning',
          message: `Execution cancelled by operator at Step ${stepNumber} (${node.data?.label || node.id})`,
        });
        return execDoc;
      }

      if (signal === 'PAUSE') {
        execDoc.status = 'PAUSED';
        execDoc.currentNode = node.id;
        await execDoc.save();

        await monitoringAgent.emitEvent({
          executionId,
          workflowId,
          nodeId: node.id,
          agent: 'orchestrator',
          level: 'warning',
          message: `Execution paused by operator at Step ${stepNumber}`,
        });
        return execDoc;
      }

      execDoc.currentNode = node.id;
      await execDoc.save();

      // Execution Agent: Run Node
      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        nodeId: node.id,
        agent: 'execution',
        level: 'info',
        message: `Executing Step ${stepNumber}/${planResult.totalSteps}: "${node.data?.label || node.id}" [${node.data?.provider || 'system'}:${node.data?.action || 'run'}]`,
        metadata: { nodeData: node.data },
      });

      let nodeOutput = null;
      let attempt = 0;
      let stepSuccess = false;
      const maxRetries = 2;

      while (attempt <= maxRetries && !stepSuccess) {
        try {
          // Add brief natural delay for smooth realistic operator observation
          await new Promise((r) => setTimeout(r, 600));

          nodeOutput = await this.executionAgent.executeNode(node, {
            userId,
            executionMemory,
            stepIndex: stepNumber,
          });

          // Validation Agent: Verify Output
          await monitoringAgent.emitEvent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'validation',
            level: 'info',
            message: `Validation Agent verifying output schema for Step ${stepNumber}...`,
          });

          const validationResult = await validationAgent.validate(node, nodeOutput);
          if (!validationResult.isValid) {
            throw new Error(`Validation Error [${validationResult.errorType}]: ${validationResult.message}`);
          }

          await monitoringAgent.emitEvent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'validation',
            level: 'success',
            message: `Validation passed for Step ${stepNumber}: output integrity verified.`,
            metadata: { checkedFields: validationResult.checkedFields },
          });

          stepSuccess = true;
          stepOutputs[node.id] = nodeOutput;
          executionMemory[`step${stepNumber}`] = nodeOutput;

          await monitoringAgent.emitEvent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'execution',
            level: 'success',
            message: `Step ${stepNumber} completed successfully.`,
            metadata: { output: nodeOutput },
          });
        } catch (nodeErr) {
          attempt++;
          execDoc.retryCount = (execDoc.retryCount || 0) + 1;
          await execDoc.save();

          // Recovery Agent: Classify & Decide
          await monitoringAgent.emitEvent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'recovery',
            level: 'warning',
            message: `Recovery Agent activated for error: "${nodeErr.message}". Analyzing failure classification...`,
          });

          const recoveryPlan = recoveryAgent.classifyFailure(nodeErr, attempt, maxRetries);

          await monitoringAgent.emitEvent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'recovery',
            level: recoveryPlan.strategy === 'retry_with_backoff' ? 'warning' : 'error',
            message: `Failure classified as [${recoveryPlan.failureType}]. Strategy: ${recoveryPlan.strategy.toUpperCase()}. ${recoveryPlan.reason}`,
            metadata: recoveryPlan,
          });

          if (recoveryPlan.strategy === 'retry_with_backoff' && attempt <= maxRetries) {
            execDoc.status = 'RETRYING';
            await execDoc.save();
            await new Promise((r) => setTimeout(r, recoveryPlan.backoffMs));
          } else {
            failed = true;
            failureReason = {
              message: nodeErr.message,
              nodeId: node.id,
              failureType: recoveryPlan.failureType,
              step: stepNumber,
            };
            break;
          }
        }
      }

      if (failed) break;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (failed) {
      execDoc.status = 'FAILED';
      execDoc.error = failureReason;
      execDoc.outputs = stepOutputs;
      execDoc.endTime = new Date(endTime);
      execDoc.duration = duration;
      await execDoc.save();

      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'orchestrator',
        level: 'error',
        message: `Workflow execution FAILED at node "${failureReason?.nodeId}". Duration: ${(duration / 1000).toFixed(2)}s`,
        metadata: { error: failureReason },
      });

      // Send alert notification
      await notificationService.createNotification({
        owner: userId,
        workflowId,
        executionId,
        type: 'failure',
        title: `Workflow Run Failed: ${workflow.name}`,
        message: `Execution failed at step "${failureReason?.nodeId}": ${failureReason?.message}`,
      });
    } else {
      execDoc.status = 'COMPLETED';
      execDoc.outputs = stepOutputs;
      execDoc.endTime = new Date(endTime);
      execDoc.duration = duration;
      await execDoc.save();

      await monitoringAgent.emitEvent({
        executionId,
        workflowId,
        agent: 'orchestrator',
        level: 'success',
        message: `All ${planResult.totalSteps} workflow steps completed successfully! Total duration: ${(duration / 1000).toFixed(2)}s`,
        metadata: { outputs: stepOutputs, durationMs: duration },
      });

      // Send success notification
      await notificationService.createNotification({
        owner: userId,
        workflowId,
        executionId,
        type: 'success',
        title: `Workflow Run Completed: ${workflow.name}`,
        message: `Workflow "${workflow.name}" completed all ${planResult.totalSteps} steps with 100% success.`,
      });
    }

    this.clearSignal(executionId);
    return execDoc;
  }
}

export const orchestrator = new Orchestrator();
