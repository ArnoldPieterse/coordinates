import React from 'react';

const MOCK_PLAYERS = [
  { name: 'Alice', planet: 'Mars', status: 'In Game' },
  { name: 'Bob', planet: 'Venus', status: 'Lobby' },
  { name: 'Eve', planet: 'Earth', status: 'In Game' },
];

export default function Play() {
  return (
    <div className="play-page">
      <h1>Game Launcher</h1>
      <div className="server-status">Server: <b>Online</b> | Players: <b>{MOCK_PLAYERS.length}</b></div>
      <button className="play-btn">Launch Game</button>
      <h2>Players Online</h2>
      <ul className="player-list">
        {MOCK_PLAYERS.map(p => (
          <li key={p.name}>{p.name} - {p.planet} ({p.status})</li>
        ))}
      </ul>
    </div>
  );
} 