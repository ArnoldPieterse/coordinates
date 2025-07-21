import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.static('.'));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Simple test server running'
  });
});

// Simple status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Test server is running successfully'
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log(`Test client connected: ${socket.id}`);
    
    socket.emit('test', { message: 'Server is working!' });
    
    socket.on('disconnect', () => {
        console.log(`Test client disconnected: ${socket.id}`);
    });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Test available at: http://localhost:${PORT}`);
}); 