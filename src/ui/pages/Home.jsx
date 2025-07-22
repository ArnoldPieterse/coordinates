import React, { useState, useRef, useEffect } from 'react';
import TrendingIntegrationsDashboard from '../components/ai/TrendingIntegrationsDashboard';
import io from 'socket.io-client';
import axios from 'axios';

// Mock contacts/groups data
const mockContacts = [
  { id: 'ai-1', name: 'Claude AI', type: 'ai', avatar: '🤖' },
  { id: 'ai-2', name: 'GPT-4', type: 'ai', avatar: '🤖' },
  { id: 'group-1', name: 'AI Research Group', type: 'group', avatar: '👥', members: ['Claude AI', 'GPT-4', 'You'] },
  { id: 'user-1', name: 'Alice', type: 'user', avatar: '🧑' },
  { id: 'user-2', name: 'Bob', type: 'user', avatar: '🧑' },
];

const initialChatHistory = {
  'ai-1': [
    { sender: 'You', content: 'Hello Claude!', timestamp: Date.now() - 60000 },
    { sender: 'Claude AI', content: 'Hello! How can I assist you today?', timestamp: Date.now() - 59000 },
  ],
  'ai-2': [
    { sender: 'You', content: 'Hi GPT-4!', timestamp: Date.now() - 60000 },
    { sender: 'GPT-4', content: 'Hi! Ready to help with your questions.', timestamp: Date.now() - 59000 },
  ],
  'group-1': [
    { sender: 'You', content: 'Welcome to the AI Research Group!', timestamp: Date.now() - 60000 },
    { sender: 'Claude AI', content: 'Excited to collaborate!', timestamp: Date.now() - 59000 },
    { sender: 'GPT-4', content: 'Let’s start our research.', timestamp: Date.now() - 58000 },
  ],
  'user-1': [
    { sender: 'You', content: 'Hey Alice!', timestamp: Date.now() - 60000 },
    { sender: 'Alice', content: 'Hey! How are you?', timestamp: Date.now() - 59000 },
  ],
  'user-2': [
    { sender: 'You', content: 'Hi Bob!', timestamp: Date.now() - 60000 },
    { sender: 'Bob', content: 'Hi there!', timestamp: Date.now() - 59000 },
  ],
};

function CreateGroupModal({ contacts, onCreate, onClose }) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [avatar, setAvatar] = useState('👥');

  const toggleMember = (id) => {
    setSelectedMembers(members =>
      members.includes(id) ? members.filter(m => m !== id) : [...members, id]
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#181c24', padding: 32, borderRadius: 12, minWidth: 340, color: '#fff', boxShadow: '0 4px 32px #0008' }}>
        <h2 style={{ marginTop: 0 }}>Create New Group</h2>
        <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group name" style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #23283a', background: '#23283a', color: '#fff' }} />
        <div style={{ marginBottom: 12 }}>
          <label>Avatar: </label>
          <input value={avatar} onChange={e => setAvatar(e.target.value)} style={{ width: 40, textAlign: 'center', fontSize: 24, borderRadius: 6, border: '1px solid #23283a', background: '#23283a', color: '#fff' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Members:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {contacts.filter(c => c.type !== 'group').map(c => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="checkbox" checked={selectedMembers.includes(c.id)} onChange={() => toggleMember(c.id)} />
                <span>{c.avatar} {c.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#23283a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px' }}>Cancel</button>
          <button onClick={() => {
            if (groupName && selectedMembers.length > 0) {
              onCreate({ groupName, selectedMembers, avatar });
            }
          }} style={{ background: '#4FC3F7', color: '#181c24', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold' }}>Create Group</button>
        </div>
      </div>
    </div>
  );
}

function ManageMembersModal({ group, contacts, onUpdate, onClose }) {
  const [selectedMembers, setSelectedMembers] = useState(group.members.map(name => contacts.find(c => c.name === name)?.id).filter(Boolean));

  const toggleMember = (id) => {
    setSelectedMembers(members =>
      members.includes(id) ? members.filter(m => m !== id) : [...members, id]
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#181c24', padding: 32, borderRadius: 12, minWidth: 340, color: '#fff', boxShadow: '0 4px 32px #0008' }}>
        <h2 style={{ marginTop: 0 }}>Manage Members</h2>
        <div style={{ marginBottom: 12 }}>
          <label>Members:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {contacts.filter(c => c.type !== 'group').map(c => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="checkbox" checked={selectedMembers.includes(c.id)} onChange={() => toggleMember(c.id)} />
                <span>{c.avatar} {c.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#23283a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px' }}>Cancel</button>
          <button onClick={() => {
            onUpdate(selectedMembers.map(id => contacts.find(c => c.id === id)?.name || id));
          }} style={{ background: '#4FC3F7', color: '#181c24', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold' }}>Update</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [contacts, setContacts] = useState(mockContacts);
  const [selectedChat, setSelectedChat] = useState(mockContacts[0]);
  const [chatHistory, setChatHistory] = useState(initialChatHistory);
  const [message, setMessage] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const inputRef = useRef();
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [jwt, setJwt] = useState(localStorage.getItem('jwt') || '');
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  // Login handler
  const handleLogin = async () => {
    if (!loginInput.trim()) return setLoginError('Username required');
    try {
      const res = await axios.post('/api/login', { username: loginInput });
      localStorage.setItem('jwt', res.data.token);
      localStorage.setItem('username', loginInput);
      setJwt(res.data.token);
      setUsername(loginInput);
      setLoginError('');
    } catch (e) {
      setLoginError('Login failed');
    }
  };

  // Socket.IO presence
  useEffect(() => {
    if (!jwt || !username) return;
    if (socketRef.current) return;
    const socket = io('/', { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('userOnline', username);
    socket.on('presenceUpdate', (users) => setOnlineUsers(users));
    return () => { socket.disconnect(); };
  }, [jwt, username]);

  // Use JWT in API requests
  axios.defaults.headers.common['Authorization'] = jwt ? `Bearer ${jwt}` : '';

  // Show login form if not logged in
  if (!jwt || !username) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#10131a', color: '#fff' }}>
        <div style={{ background: '#181c24', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0008', minWidth: 320 }}>
          <h2 style={{ marginBottom: 16 }}>Sign in to Rekursing</h2>
          <input
            type="text"
            placeholder="Enter username"
            value={loginInput}
            onChange={e => setLoginInput(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #333', marginBottom: 12, fontSize: 16 }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
          />
          <button onClick={handleLogin} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#4FC3F7', color: '#181c24', fontWeight: 'bold', fontSize: 16, border: 'none', cursor: 'pointer' }}>Sign In</button>
          {loginError && <div style={{ color: '#f55', marginTop: 10 }}>{loginError}</div>}
        </div>
      </div>
    );
  }

  // Handle sending a message (mock logic)
  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatHistory(prev => ({
      ...prev,
      [selectedChat.id]: [
        ...(prev[selectedChat.id] || []),
        { sender: 'You', content: message, timestamp: Date.now() },
      ],
    }));
    setMessage('');
  };

  // Handle pinning a message
  const handlePinMessage = (msgIdx) => {
    setPinnedMessages(prev => ({
      ...prev,
      [selectedChat.id]: [
        ...(prev[selectedChat.id] || []),
        chatHistory[selectedChat.id][msgIdx],
      ],
    }));
  };

  // Handle @mentions (simple highlight)
  const highlightMentions = (text) => {
    return text.split(/(@\w+)/g).map((part, i) =>
      part.startsWith('@') ? <span key={i} style={{ color: '#4FC3F7', fontWeight: 'bold' }}>{part}</span> : part
    );
  };

  // Handle group creation
  const handleCreateGroup = ({ groupName, selectedMembers, avatar }) => {
    const newId = `group-${Date.now()}`;
    const newGroup = { id: newId, name: groupName, type: 'group', avatar, members: selectedMembers.map(id => contacts.find(c => c.id === id)?.name || id) };
    setContacts(prev => [...prev, newGroup]);
    setChatHistory(prev => ({ ...prev, [newId]: [] }));
    setShowCreateGroup(false);
    setSelectedChat(newGroup);
  };

  // Handle group member update
  const handleUpdateMembers = (newMembers) => {
    setContacts(prev => prev.map(c =>
      c.id === selectedChat.id ? { ...c, members: newMembers } : c
    ));
    setShowManageMembers(false);
  };

  // Handle group-level AI actions (mock)
  const handleGroupAIAction = async (action) => {
    setAiLoading(true);
    setTimeout(() => {
      setChatHistory(prev => ({
        ...prev,
        [selectedChat.id]: [
          ...(prev[selectedChat.id] || []),
          { sender: 'Claude AI', content: action === 'summarize' ? 'Summary: This is a mock summary of the group discussion.' : 'Scheduled: Mock group event scheduled.', timestamp: Date.now() },
        ],
      }));
      setAiLoading(false);
    }, 1200);
  };

  // Autocomplete for @mentions
  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    const match = val.match(/@([\w]*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const suggestions = (selectedChat.members || []).filter(name => name.toLowerCase().startsWith(query));
      setMentionSuggestions(suggestions);
    } else {
      setMentionSuggestions([]);
    }
  };

  const handleMentionClick = (name) => {
    setMessage(msg => msg.replace(/@([\w]*)$/, `@${name} `));
    setMentionSuggestions([]);
    inputRef.current?.focus();
  };

  // Render chat content based on selected contact/group
  let chatContent;
  if (selectedChat.type === 'ai') {
    chatContent = <TrendingIntegrationsDashboard integrationsManager={{}} onClose={() => {}} />;
  } else if (selectedChat.type === 'group' || selectedChat.type === 'user') {
    const history = chatHistory[selectedChat.id] || [];
    const pinned = pinnedMessages[selectedChat.id] || [];
    chatContent = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Pinned messages */}
        {pinned.length > 0 && (
          <div style={{ background: '#23283a', borderRadius: 6, padding: 8, marginBottom: 8 }}>
            <b>Pinned:</b>
            {pinned.map((msg, idx) => (
              <div key={idx} style={{ color: msg.sender === 'You' ? '#4FC3F7' : '#fff', marginBottom: 4 }}>
                <b>{msg.sender}:</b> <span>{highlightMentions(msg.content)}</span>
                <span style={{ fontSize: '0.8em', color: '#888', marginLeft: 8 }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, background: '#181c24', borderRadius: 8, padding: 16 }}>
          {history.length === 0 ? (
            <div style={{ color: '#aaa' }}>No messages yet.</div>
          ) : (
            history.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: 12, color: msg.sender === 'You' ? '#4FC3F7' : '#fff', position: 'relative' }}>
                <b>{msg.sender}:</b> <span>{highlightMentions(msg.content)}</span>
                <span style={{ fontSize: '0.8em', color: '#888', marginLeft: 8 }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                <button onClick={() => handlePinMessage(idx)} style={{ position: 'absolute', right: 0, top: 0, background: 'none', border: 'none', color: '#FFD700', cursor: 'pointer', fontSize: 16 }} title="Pin message">📌</button>
              </div>
            ))
          )}
        </div>
        {/* Group-level AI actions (mock) */}
        {selectedChat.type === 'group' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button disabled={aiLoading} onClick={() => handleGroupAIAction('summarize')} style={{ background: '#4FC3F7', color: '#181c24', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold' }}>Summarize</button>
            <button disabled={aiLoading} onClick={() => handleGroupAIAction('schedule')} style={{ background: '#4FC3F7', color: '#181c24', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold' }}>Schedule</button>
            <button onClick={() => setShowManageMembers(true)} style={{ background: '#23283a', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold' }}>Manage Members</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder={selectedChat.type === 'group' ? 'Message group...' : 'Message...'}
            style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #23283a', background: '#23283a', color: '#fff' }}
            onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
          />
          {mentionSuggestions.length > 0 && (
            <div style={{ position: 'absolute', left: 0, top: 38, background: '#23283a', borderRadius: 6, boxShadow: '0 2px 8px #0008', zIndex: 10, minWidth: 120 }}>
              {mentionSuggestions.map(name => (
                <div key={name} onClick={() => handleMentionClick(name)} style={{ padding: 8, cursor: 'pointer', color: '#4FC3F7' }}>{name}</div>
              ))}
            </div>
          )}
          <button onClick={handleSendMessage} style={{ padding: '0 18px', borderRadius: 6, background: '#4FC3F7', color: '#181c24', border: 'none', fontWeight: 'bold' }}>Send</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page" style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar for contacts/groups */}
      <aside style={{ width: 280, background: '#181c24', color: '#fff', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #222' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Chats & Groups</h2>
          <button onClick={() => setShowCreateGroup(true)} style={{ background: '#4FC3F7', color: '#181c24', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }}>+</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' }}>
          {contacts.map(contact => (
            <li
              key={contact.id}
              onClick={() => setSelectedChat(contact)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: selectedChat.id === contact.id ? '#23283a' : 'none',
                borderBottom: '1px solid #23283a',
                fontWeight: selectedChat.id === contact.id ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span style={{ fontSize: 22, marginRight: 8 }}>{contact.avatar}</span>
              <span>{contact.name}</span>
              {contact.type === 'group' && <span style={{ fontSize: 12, color: '#aaa', marginLeft: 'auto' }}>{contact.members?.length} members</span>}
              {contact.type === 'user' && (
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: onlineUsers.includes(contact.name) ? '#4caf50' : '#888', display: 'inline-block', marginRight: 8, border: '1px solid #222' }} />
              )}
            </li>
          ))}
        </ul>
        <div style={{ padding: '1rem', borderTop: '1px solid #222', fontSize: '0.9rem', color: '#aaa' }}>
          <div>Logged in as <b>You</b></div>
        </div>
      </aside>

      {/* Main content area: AI chat interface or group/user chat */}
      <main style={{ flex: 1, background: '#10131a', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1.5rem 2rem 1rem 2rem', borderBottom: '1px solid #23283a', background: '#181c24' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>🌌 Welcome to Rekursing</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#aaa' }}>AI-powered group and personal chats. Select a contact or group to start chatting!</p>
        </header>
        <div style={{ flex: 1, overflow: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          {chatContent}
        </div>
      </main>
      {showCreateGroup && <CreateGroupModal contacts={contacts} onCreate={handleCreateGroup} onClose={() => setShowCreateGroup(false)} />}
      {showManageMembers && selectedChat.type === 'group' && <ManageMembersModal group={selectedChat} contacts={contacts} onUpdate={handleUpdateMembers} onClose={() => setShowManageMembers(false)} />}
    </div>
  );
} 