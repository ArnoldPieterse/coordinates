import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './unified-ui/App';

// Initialize React application
const container = document.getElementById('root');
const root = createRoot(container);

// Render the unified UI application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// (AI Agent System initialization removed for frontend build) 