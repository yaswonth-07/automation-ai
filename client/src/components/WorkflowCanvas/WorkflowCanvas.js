import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode, AINode, IntegrationNode, LogicNode, ActionNode } from './CustomNodes';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowCanvas({ readOnly = false }) {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNode,
    addNode,
  } = useWorkflowStore();

  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNode,
      aiNode: AINode,
      integrationNode: IntegrationNode,
      logicNode: LogicNode,
      actionNode: ActionNode,
    }),
    []
  );

  const onNodesChange = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (params) => {
      setEdges(addEdge({ ...params, animated: true }, edges));
    },
    [edges, setEdges]
  );

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Handle Drag-and-Drop from NodePalette
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeDataStr = event.dataTransfer.getData('application/agentflow-node');
      if (!nodeDataStr) return;

      const template = JSON.parse(nodeDataStr);
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 40,
      };

      const newNode = {
        id: `node_${Date.now()}`,
        type: template.type,
        position,
        data: {
          label: template.label,
          category: template.category,
          provider: template.provider,
          action: template.action,
          params: template.params || {},
          description: template.description || '',
        },
      };

      addNode(newNode);
    },
    [addNode]
  );

  return (
    <div className="w-full h-full relative bg-dark-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={readOnly ? undefined : onDragOver}
        onDrop={readOnly ? undefined : onDrop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-dark-950"
      >
        <Background color="#1f2942" gap={20} size={1.5} variant={BackgroundVariant.Dots} />
        <Controls className="!bg-dark-900 !border-slate-800 !text-slate-300 [&>button]:!border-slate-800 [&>button]:!bg-dark-850" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-dark-900 !border-slate-800 !rounded-xl overflow-hidden"
          nodeColor={(n) => {
            if (n.type === 'triggerNode') return '#f59e0b';
            if (n.type === 'aiNode') return '#a855f7';
            if (n.type === 'integrationNode') return '#6366f1';
            if (n.type === 'logicNode') return '#06b6d4';
            return '#64748b';
          }}
        />
      </ReactFlow>
    </div>
  );
}
