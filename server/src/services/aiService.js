import { ENV } from '../config/env.js';

export class AIService {
  /**
   * Generates a workflow graph (nodes, edges, triggerConfig, metadata) from natural language
   */
  async generateWorkflow(prompt) {
    const cleanPrompt = (prompt || '').trim();
    if (!cleanPrompt) {
      throw new Error('Prompt cannot be empty');
    }

    // Tier 1: Try OpenRouter if API key is provided
    if (ENV.OPENROUTER_API_KEY) {
      try {
        console.log('[AIService] Generating workflow using OpenRouter...');
        const result = await this.generateWithOpenRouter(cleanPrompt);
        if (result) return { ...result, generatorUsed: 'openrouter' };
      } catch (err) {
        console.warn('[AIService] OpenRouter failed, attempting fallback to Gemini:', err.message);
      }
    }

    // Tier 2: Try Gemini if API key is provided
    if (ENV.GEMINI_API_KEY) {
      try {
        console.log('[AIService] Generating workflow using Google Gemini...');
        const result = await this.generateWithGemini(cleanPrompt);
        if (result) return { ...result, generatorUsed: 'gemini' };
      } catch (err) {
        console.warn('[AIService] Gemini failed, attempting deterministic builder fallback:', err.message);
      }
    }

    // Tier 3: Deterministic Rule-Based Builder Fallback
    console.log('[AIService] Generating workflow using Deterministic Rule-Based Builder...');
    const result = this.generateDeterministicWorkflow(cleanPrompt);
    return { ...result, generatorUsed: 'deterministic-rules' };
  }

  async generateWithOpenRouter(prompt) {
    const systemPrompt = this.getSystemPrompt();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ENV.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://agentflow.local',
        'X-Title': 'Agentflow AI',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  }

  async generateWithGemini(prompt) {
    const systemPrompt = this.getSystemPrompt();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ENV.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser Request: ${prompt}\nReturn strictly valid JSON only.` }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
  }

  getSystemPrompt() {
    return `You are the Agentflow AI Workflow Compiler.
Convert the user's natural language automation request into a complete, executable workflow graph.
Return a single JSON object with this exact structure:
{
  "name": "string (clear title)",
  "description": "string (summary)",
  "tags": ["string"],
  "triggerConfig": {
    "type": "manual" | "webhook" | "schedule" | "email_received",
    "config": {}
  },
  "nodes": [
    {
      "id": "node-1",
      "type": "triggerNode" | "actionNode" | "aiNode" | "integrationNode" | "logicNode",
      "position": { "x": 250, "y": 100 },
      "data": {
        "label": "string",
        "category": "trigger" | "action" | "ai" | "integration" | "logic",
        "provider": "system" | "gmail" | "slack" | "discord" | "google-sheets" | "llm",
        "action": "string",
        "params": {},
        "description": "string"
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "node-1",
      "target": "node-2",
      "animated": true,
      "label": "string" (optional)
    }
  ]
}
Coordinates should arrange nodes sequentially top-to-bottom with x=250 and y spaced by 140px.`;
  }

  /**
   * Deterministic Rule-Based Builder: Handles email, invoice, Slack, Discord, Google Sheets, AI analysis
   */
  generateDeterministicWorkflow(prompt) {
    const lower = prompt.toLowerCase();
    const nodes = [];
    const edges = [];
    let currentY = 80;
    let stepIndex = 1;

    function addNode(type, label, category, provider, action, params, description) {
      const id = `node-${stepIndex}`;
      nodes.push({
        id,
        type,
        position: { x: 280, y: currentY },
        data: {
          label,
          category,
          provider,
          action,
          params,
          description,
        },
      });

      if (stepIndex > 1) {
        const prevId = `node-${stepIndex - 1}`;
        edges.push({
          id: `e-${prevId}-${id}`,
          source: prevId,
          target: id,
          animated: true,
        });
      }

      currentY += 140;
      stepIndex++;
      return id;
    }

    // 1. Determine Trigger
    if (lower.includes('email') && (lower.includes('receive') || lower.includes('when') || lower.includes('inbox') || lower.includes('new email'))) {
      addNode('triggerNode', 'Gmail Email Received', 'trigger', 'gmail', 'read_emails', { query: 'is:unread label:inbox' }, 'Triggers when a new email is detected');
    } else if (lower.includes('schedule') || lower.includes('daily') || lower.includes('hourly') || lower.includes('every')) {
      addNode('triggerNode', 'Scheduled Cron Trigger', 'trigger', 'system', 'cron_trigger', { cron: '0 9 * * *', timezone: 'UTC' }, 'Triggers on a scheduled basis');
    } else if (lower.includes('webhook') || lower.includes('api call')) {
      addNode('triggerNode', 'Incoming Webhook Trigger', 'trigger', 'system', 'webhook_trigger', { method: 'POST', endpoint: '/webhook/v1' }, 'Triggers when a POST webhook is received');
    } else {
      addNode('triggerNode', 'Manual Operator Trigger', 'trigger', 'system', 'manual_trigger', {}, 'Initiated on-demand by operator');
    }

    // 2. Determine AI / Analysis Step
    if (lower.includes('invoice') || lower.includes('extract') || lower.includes('parse') || lower.includes('summarize') || lower.includes('classify') || lower.includes('sentiment') || lower.includes('ai')) {
      addNode(
        'aiNode',
        'AI Data Extraction & Reasoning',
        'ai',
        'llm',
        'extract_structured_data',
        {
          instruction: lower.includes('invoice')
            ? 'Extract vendor, total amount, due date, line items, and invoice number.'
            : 'Analyze payload, extract key entities, classify urgency, and generate a concise summary.',
          model: 'claude-3.5-sonnet',
          outputFormat: 'json',
        },
        'Extracts structured insights and metadata using AI'
      );
    }

    // 3. Determine Validation / Logic Step
    if (lower.includes('if') || lower.includes('condition') || lower.includes('validate') || lower.includes('threshold') || lower.includes('invoice') || lower.includes('urgent')) {
      addNode(
        'logicNode',
        'Validation & Routing Gate',
        'logic',
        'system',
        'evaluate_condition',
        {
          condition: 'output.confidence > 0.85 && output.valid === true',
          onTrue: 'proceed',
          onFalse: 'escalate_to_operator',
        },
        'Validates confidence scores and required payload fields'
      );
    }

    // 4. Determine Google Sheets Logging Step
    if (lower.includes('sheet') || lower.includes('log') || lower.includes('record') || lower.includes('table') || lower.includes('audit')) {
      addNode(
        'integrationNode',
        'Google Sheets Record Log',
        'integration',
        'google-sheets',
        'append_row',
        {
          spreadsheetId: 'ops_audit_spreadsheet',
          range: 'AuditLog!A:F',
          values: ['{{timestamp}}', '{{executionId}}', '{{status}}', '{{summary}}'],
        },
        'Appends execution metadata and records to Google Sheets'
      );
    }

    // 5. Determine Slack / Discord Notification
    if (lower.includes('slack')) {
      addNode(
        'integrationNode',
        'Slack Ops Channel Alert',
        'integration',
        'slack',
        'post_message',
        {
          channel: '#devops-alerts',
          text: '🚀 *Workflow Event Notification*\n• Status: Completed\n• Details: Processed successfully by Agentflow AI.',
        },
        'Broadcasts event notification to Slack channel'
      );
    } else if (lower.includes('discord')) {
      addNode(
        'integrationNode',
        'Discord Webhook Dispatch',
        'integration',
        'discord',
        'post_message',
        {
          channelId: 'ops-feed',
          content: '📢 **Agentflow Workflow Notification**: Step completed successfully with 100% confidence.',
        },
        'Posts an automated message to Discord guild channel'
      );
    }

    // 6. Determine Email Sending Step
    if (lower.includes('send email') || lower.includes('notify via email') || lower.includes('forward') || lower.includes('dispatch email') || (!lower.includes('slack') && !lower.includes('discord') && !lower.includes('sheet'))) {
      addNode(
        'integrationNode',
        'Gmail Dispatch Notification',
        'integration',
        'gmail',
        'send_email',
        {
          to: 'operator@agentflow.local',
          subject: 'Automation Workflow Execution Summary',
          body: 'Hello,\n\nThe automated workflow has finished executing all agent stages. Audit trail is recorded.',
        },
        'Sends final confirmation email via Gmail'
      );
    }

    const titleWords = prompt.split(' ').slice(0, 5).join(' ');
    const workflowName = titleWords.length > 3 ? `${titleWords.charAt(0).toUpperCase() + titleWords.slice(1)} Automation` : 'Custom AI Operations Workflow';

    return {
      name: workflowName,
      description: `Automated agent workflow generated from prompt: "${prompt}"`,
      tags: ['ai-generated', 'automation', 'operations'],
      triggerConfig: {
        type: nodes[0]?.data?.action || 'manual',
        config: nodes[0]?.data?.params || {},
      },
      nodes,
      edges,
      version: 1,
    };
  }
}

export const aiService = new AIService();
