const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Add at top
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// LM Studio API base URL
const LM_STUDIO_URL = 'http://10.3.129.26:1234/v1/chat/completions';
const LM_MODEL = 'your-model-name'; // Replace with your LM Studio model name

// AI action endpoint: summarize group chat using LM Studio
app.post('/api/group/summarize', async (req, res) => {
  const { history } = req.body;
  try {
    const prompt = `Summarize the following group chat:\n${history.map(m => m.sender + ': ' + m.content).join('\n')}`;
    const lmRes = await axios.post(LM_STUDIO_URL, {
      model: LM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });
    res.json({ result: lmRes.data.choices[0].message.content });
  } catch (e) {
    res.json({ result: 'LM Studio summarization failed.' });
  }
});

// AI action endpoint: schedule (now using LM Studio)
app.post('/api/group/schedule', async (req, res) => {
  const { history } = req.body;
  try {
    const prompt = `Based on the following group chat, suggest a good time for a group meeting and explain why.\n${history.map(m => m.sender + ': ' + m.content).join('\n')}`;
    const lmRes = await axios.post(LM_STUDIO_URL, {
      model: LM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });
    res.json({ result: lmRes.data.choices[0].message.content });
  } catch (e) {
    res.json({ result: 'LM Studio scheduling failed.' });
  }
});

// --- AUTHENTICATION ---
// Simple login endpoint (for demo; replace with real user DB in prod)
app.post('/api/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  // In production, validate user credentials here
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// JWT auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Example protected route
app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// --- PRESENCE ---
let onlineUsers = {};

// WebSocket server for real-time chat
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('joinGroup', (groupId) => socket.join(groupId));
  socket.on('leaveGroup', (groupId) => socket.leave(groupId));
  socket.on('groupMessage', ({ groupId, msg }) => {
    io.to(groupId).emit('groupMessage', msg);
  });

  // User presence
  socket.on('userOnline', (username) => {
    onlineUsers[username] = true;
    io.emit('presenceUpdate', Object.keys(onlineUsers));
    socket.username = username;
  });
  socket.on('disconnect', () => {
    if (socket.username) {
      delete onlineUsers[socket.username];
      io.emit('presenceUpdate', Object.keys(onlineUsers));
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 