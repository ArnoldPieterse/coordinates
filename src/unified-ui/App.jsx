import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Play from './pages/Play';
import AIAgentDashboard from './pages/AIAgentDashboard';
import GenLab from './pages/GenLab';
import Docs from './pages/Docs';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import './style.css';

const PAGES = {
  home: Home,
  play: Play,
  ai: AIAgentDashboard,
  genlab: GenLab,
  docs: Docs,
  tools: Tools,
  settings: Settings,
};

export default function App() {
  const [page, setPage] = useState('home');

  // Simulate async AI agent system (background jobs)
  useEffect(() => {
    // This could connect to a backend or use a mock agent system
    // For now, just simulate agent activity
  }, []);

  const PageComponent = PAGES[page] || Home;

  return (
    <div className="unified-ui-root">
      <NavBar current={page} onNavigate={setPage} />
      <main className="main-content">
        <PageComponent />
      </main>
    </div>
  );
} 