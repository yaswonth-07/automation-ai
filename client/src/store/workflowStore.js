import { create } from 'zustand';
import api from '../services/api';

export const useWorkflowStore = create((set, get) => ({
  workflows: [],
  activeWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false,
  isLoading: false,
  isGenerating: false,
  error: null,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),
  setSelectedNode: (node) => set({ selectedNode: node }),

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      }),
      isDirty: true,
      selectedNode: state.selectedNode?.id === nodeId 
        ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...data } }
        : state.selectedNode,
    }));
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
      isDirty: true,
      selectedNode: node,
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
      isDirty: true,
    }));
  },

  fetchWorkflows: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/workflows', { params });
      set({ workflows: res.data.workflows || [], isLoading: false });
      return res.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return null;
    }
  },

  loadWorkflow: async (workflowId) => {
    set({ isLoading: true, error: null, selectedNode: null });
    try {
      const res = await api.get(`/workflows/${workflowId}`);
      const workflow = res.data.data;
      set({
        activeWorkflow: workflow,
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        isDirty: false,
        isLoading: false,
      });
      return workflow;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return null;
    }
  },

  saveActiveWorkflow: async () => {
    const { activeWorkflow, nodes, edges } = get();
    if (!activeWorkflow) return null;

    set({ isLoading: true, error: null });
    try {
      const res = await api.put(`/workflows/${activeWorkflow._id}`, {
        name: activeWorkflow.name,
        description: activeWorkflow.description,
        tags: activeWorkflow.tags,
        nodes,
        edges,
        triggerConfig: activeWorkflow.triggerConfig,
      });
      const updated = res.data.data;
      set({ activeWorkflow: updated, isDirty: false, isLoading: false });
      return updated;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return null;
    }
  },

  generateFromPrompt: async (prompt) => {
    set({ isGenerating: true, error: null });
    try {
      const res = await api.post('/workflows/generate', { prompt });
      const generated = res.data.data;
      set({
        nodes: generated.nodes || [],
        edges: generated.edges || [],
        isDirty: true,
        isGenerating: false,
      });
      return generated;
    } catch (err) {
      set({ isGenerating: false, error: err.message });
      throw err;
    }
  },

  createWorkflow: async (workflowData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/workflows', workflowData);
      const created = res.data.data;
      set((state) => ({
        workflows: [created, ...state.workflows],
        activeWorkflow: created,
        nodes: created.nodes || [],
        edges: created.edges || [],
        isDirty: false,
        isLoading: false,
      }));
      return created;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },
}));
