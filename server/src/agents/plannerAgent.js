/**
 * Planner Agent: Analyzes graph topology, determines execution DAG sequence,
 * validates prerequisites, detects cycles, and calculates planning confidence score.
 */
export class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  async plan(workflow) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    if (!nodes.length) {
      return {
        success: false,
        confidenceScore: 0.0,
        error: 'Workflow contains no nodes to execute',
        executionPlan: [],
      };
    }

    // Build Adjacency List and In-Degree Map for Topological Sort (Kahn's algorithm)
    const inDegree = new Map();
    const adjList = new Map();
    const nodeMap = new Map();

    nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
      nodeMap.set(node.id, node);
    });

    edges.forEach((edge) => {
      if (inDegree.has(edge.target) && adjList.has(edge.source)) {
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
        adjList.get(edge.source).push(edge.target);
      }
    });

    // Find all starting nodes (in-degree == 0)
    const queue = [];
    inDegree.forEach((deg, nodeId) => {
      if (deg === 0) queue.push(nodeId);
    });

    const executionPlan = [];
    while (queue.length > 0) {
      const currentId = queue.shift();
      const node = nodeMap.get(currentId);
      if (node) executionPlan.push(node);

      const neighbors = adjList.get(currentId) || [];
      neighbors.forEach((neighborId) => {
        inDegree.set(neighborId, inDegree.get(neighborId) - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      });
    }

    // Cycle detection check
    const hasCycle = executionPlan.length < nodes.length;
    if (hasCycle) {
      // Fallback: use original node order if graph contains back-edges / non-DAG constructs
      const missingNodes = nodes.filter((n) => !executionPlan.find((p) => p.id === n.id));
      executionPlan.push(...missingNodes);
    }

    // Compute Confidence Score based on parameter completeness and graph sanity
    let validParamCount = 0;
    nodes.forEach((node) => {
      if (node.data?.action || node.data?.params) validParamCount++;
    });

    const completenessRatio = validParamCount / Math.max(1, nodes.length);
    const confidenceScore = Number((0.85 + completenessRatio * 0.15 - (hasCycle ? 0.2 : 0)).toFixed(2));

    return {
      success: true,
      confidenceScore: Math.max(0.1, Math.min(1.0, confidenceScore)),
      executionPlan,
      totalSteps: executionPlan.length,
      hasCycle,
      plannedAt: new Date().toISOString(),
    };
  }
}

export const plannerAgent = new PlannerAgent();
