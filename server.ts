/**
 * OpenClaw Dashboard API Server
 *
 * A backend server that proxies requests to OpenClaw CLI and Gateway.
 * All configuration is loaded from environment variables.
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { getConfig, validateConfig } from './src/config';
import { getOpenClawClient, OpenClawError } from './src/lib/openclaw-client';

// Load and validate configuration
const config = getConfig();
const validation = validateConfig(config);

if (!validation.valid) {
  console.error('Invalid configuration:');
  validation.errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

console.log('[Dashboard] Configuration loaded');
console.log(`[Dashboard] Server: http://${config.server.host}:${config.server.port}`);
console.log(`[Dashboard] OpenClaw command: ${config.openclaw.command}`);
console.log(`[Dashboard] Gateway: ${config.gateway.url}`);

// Create OpenClaw client
const openclaw = getOpenClawClient(config);

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    config: {
      gateway: config.gateway.url,
      openclaw: config.openclaw.command,
    },
  });
});

// Get all agents
app.get('/api/agents', async (_req, res) => {
  try {
    const agents = await openclaw.listAgents();
    res.json(agents);
  } catch (error) {
    console.error('[API] Failed to fetch agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get agent sessions
app.get('/api/agents/:agentId/sessions', async (req, res) => {
  try {
    const { agentId } = req.params;
    const sessions = await openclaw.getAgentSessions(agentId);
    res.json(sessions);
  } catch (error) {
    console.error('[API] Failed to fetch sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get gateway health
app.get('/api/gateway/health', async (_req, res) => {
  try {
    const health = await openclaw.getHealth();
    res.json(health);
  } catch (error) {
    console.error('[API] Failed to fetch health:', error);
    res.status(500).json({ error: 'Failed to fetch health' });
  }
});

// Get gateway status
app.get('/api/gateway/status', async (_req, res) => {
  try {
    const status = await openclaw.getStatus();
    res.json(status);
  } catch (error) {
    console.error('[API] Failed to fetch status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Send message to agent
app.post('/api/agents/:agentId/send', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message, sessionKey } = req.body;

    console.log('[API] Send message request:', { agentId, messageLength: message?.length, sessionKey });

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await openclaw.sendMessage(agentId, message, sessionKey);
    console.log('[API] Send message result:', JSON.stringify(result).substring(0, 200));
    res.json(result);
  } catch (error) {
    console.error('[API] Failed to send message:', error);
    if (error instanceof OpenClawError) {
      return res.status(500).json({
        error: error.message,
        code: error.code,
        details: error.details
      });
    }
    res.status(500).json({ error: 'Failed to send message', details: String(error) });
  }
});

// Read file from agent workspace
app.get('/api/agents/:agentId/files/:fileName', async (req, res) => {
  try {
    const { agentId, fileName } = req.params;
    const file = await openclaw.readFile(agentId, fileName);
    res.json(file);
  } catch (error) {
    if (error instanceof OpenClawError) {
      if (error.code === 'AGENT_NOT_FOUND') {
        return res.status(404).json({ error: error.message });
      }
      if (error.code === 'FILE_NOT_FOUND') {
        return res.status(404).json({ error: error.message });
      }
    }
    console.error('[API] Failed to read file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Write file to agent workspace
app.put('/api/agents/:agentId/files/:fileName', async (req, res) => {
  try {
    const { agentId, fileName } = req.params;
    const { content } = req.body;

    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await openclaw.writeFile(agentId, fileName, content);
    res.json({ success: true, path: result.path });
  } catch (error) {
    if (error instanceof OpenClawError && error.code === 'AGENT_NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    console.error('[API] Failed to write file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Get logs
app.get('/api/logs', async (_req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logPath = path.join(config.openclaw.logPath, `openclaw-${today}.log`);

    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.split('\n').slice(-100); // Last 100 lines
    res.json({ logs: lines });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'ENOENT') {
      return res.json({ logs: [], message: 'No logs found for today' });
    }
    console.error('[API] Failed to read logs:', error);
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(config.server.port, config.server.host, () => {
  console.log(`[Dashboard] API server running on http://${config.server.host}:${config.server.port}`);
  console.log('[Dashboard] Press Ctrl+C to stop');
});