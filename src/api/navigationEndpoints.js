// Navigation API Endpoints (Mock Handlers)
// Each endpoint returns mock data for the corresponding navigation item

import express from 'express';
const router = express.Router();

// Home
router.get('/api/home', (req, res) => {
  res.json({ status: 'success', page: 'Home', message: 'Welcome to Rekursing Home!' });
});

// Trading
router.get('/api/trading', (req, res) => {
  res.json({ status: 'success', page: 'Trading', data: { market: 'AI Trading Dashboard', stats: [1,2,3] } });
});

// AI Dashboard
router.get('/api/ai-dashboard', (req, res) => {
  res.json({ status: 'success', page: 'AI Dashboard', agents: ['AgentX', 'AgentY'] });
});

// GenLab
router.get('/api/genlab', (req, res) => {
  res.json({ status: 'success', page: 'GenLab', experiments: ['Exp1', 'Exp2'] });
});

// Social AI
router.get('/api/social-ai', (req, res) => {
  res.json({ status: 'success', page: 'Social AI', chat: [] });
});

// Context
router.get('/api/context', (req, res) => {
  res.json({ status: 'success', page: 'Context', contextInfo: 'AI Contextual Data' });
});

// Tools
router.get('/api/tools', (req, res) => {
  res.json({ status: 'success', page: 'Tools', tools: ['ToolA', 'ToolB'] });
});

// Docs
router.get('/api/docs', (req, res) => {
  res.json({ status: 'success', page: 'Docs', docs: ['Doc1', 'Doc2'] });
});

// Settings
router.get('/api/settings', (req, res) => {
  res.json({ status: 'success', page: 'Settings', settings: { theme: 'dark', notifications: true } });
});

// Play
router.get('/api/play', (req, res) => {
  res.json({ status: 'success', page: 'Play', message: 'Game launching soon!' });
});

export default router; 