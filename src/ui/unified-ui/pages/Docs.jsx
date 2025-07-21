import React, { useState } from 'react';

const DOC_SECTIONS = [
  'Getting Started',
  'Game Mechanics',
  'AI Agent System',
  'Procedural Generation',
  'Deployment',
  'API Reference',
  'FAQ',
];

export default function Docs() {
  const [section, setSection] = useState(DOC_SECTIONS[0]);
  return (
    <div className="docs-page">
      <h1>Documentation</h1>
      <input className="docs-search" placeholder="Search docs..." />
      <div className="docs-layout">
        <ul className="docs-sections">
          {DOC_SECTIONS.map(s => (
            <li key={s} className={section === s ? 'active' : ''} onClick={() => setSection(s)}>{s}</li>
          ))}
        </ul>
        <div className="docs-content">
          <h2>{section}</h2>
          <div className="docs-placeholder">[Documentation content for {section} goes here]</div>
        </div>
      </div>
    </div>
  );
} 