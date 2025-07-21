import React, { useState } from 'react';

export default function Settings() {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <div className="profile-section">
        <h2>User Profile</h2>
        <div className="profile-avatar">👤</div>
        <div className="profile-info">
          <div><b>Name:</b> PlayerOne</div>
          <div><b>Email:</b> player@rekursing.com</div>
        </div>
      </div>
      <div className="theme-section">
        <h2>Theme</h2>
        <label>
          <input type="checkbox" checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          Dark Mode
        </label>
      </div>
      <div className="notifications-section">
        <h2>Notifications</h2>
        <label>
          <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
          Enable notifications
        </label>
      </div>
    </div>
  );
} 