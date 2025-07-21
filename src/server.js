import express from 'express';
import navigationEndpoints from './api/navigationEndpoints.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Register navigation endpoints
app.use(navigationEndpoints);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Rekursing API server running on port ${PORT}`);
}); 