import React, { useState, useEffect } from 'react';
import SocialAIMatching from '../../ai/social/SocialAIMatching';
import './SocialAI.css';

export default function SocialAI({ appContext }) {
  const [socialAI, setSocialAI] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [showSessions, setShowSessions] = useState(false);

  // Initialize Social AI system
  useEffect(() => {
    if (!socialAI) {
      const newSocialAI = new SocialAIMatching();
      setSocialAI(newSocialAI);
      
      // Create demo users
      createDemoUsers(newSocialAI);
    }
  }, [socialAI]);

  // Create demo users for testing
  const createDemoUsers = (ai) => {
    const demoUsers = [
      {
        id: 'user1',
        name: 'Alex Chen',
        avatar: '👨‍💻',
        needs: [
          { category: 'web-development', description: 'Need help with React optimization', urgency: 'normal', budget: '500-1000', timeline: 'flexible' }
        ],
        abilities: [
          { category: 'ui-design', description: 'Expert in Figma and design systems', experience: 'expert', rate: '75-100', availability: 'flexible' }
        ],
        interests: ['react', 'design', 'startups', 'ai']
      },
      {
        id: 'user2',
        name: 'Sarah Johnson',
        avatar: '👩‍🎨',
        needs: [
          { category: 'ui-design', description: 'Looking for UI/UX designer for mobile app', urgency: 'asap', budget: '1000-2000', timeline: 'urgent' }
        ],
        abilities: [
          { category: 'web-development', description: 'Full-stack developer with React/Node.js', experience: 'advanced', rate: '60-80', availability: 'flexible' }
        ],
        interests: ['mobile-apps', 'design', 'javascript', 'entrepreneurship']
      },
      {
        id: 'user3',
        name: 'Mike Rodriguez',
        avatar: '👨‍🔬',
        needs: [
          { category: 'data-science', description: 'Need help with machine learning model', urgency: 'normal', budget: '800-1500', timeline: 'long-term' }
        ],
        abilities: [
          { category: 'data-science', description: 'ML engineer with Python/TensorFlow', experience: 'expert', rate: '90-120', availability: 'flexible' }
        ],
        interests: ['machine-learning', 'python', 'research', 'ai']
      }
    ];

    demoUsers.forEach(user => {
      ai.createUserProfile(user.id, user);
    });
  };

  // Create user profile
  const createProfile = (profileData) => {
    if (!socialAI) return;

    const userId = 'user-' + Date.now();
    const profile = socialAI.createUserProfile(userId, profileData);
    setCurrentUser(profile);
    setShowProfileForm(false);

    // Find matches for new user
    const userMatches = socialAI.findMatches(userId);
    setMatches(userMatches);
  };

  // Find matches for current user
  const findMatches = () => {
    if (!socialAI || !currentUser) return;

    const userMatches = socialAI.findMatches(currentUser.id);
    setMatches(userMatches);
    setShowMatches(true);
  };

  // Create shared AI session
  const createSession = (participantIds, topic) => {
    if (!socialAI) return;

    const session = socialAI.createSharedSession(participantIds, topic);
    setActiveSession(session);
    setShowSessions(true);
  };

  // Send message in session
  const sendMessage = (message) => {
    if (!socialAI || !activeSession || !currentUser) return;

    socialAI.addMessage(activeSession.id, currentUser.id, message);
    // Force re-render to show new message
    setActiveSession({ ...activeSession });
  };

  // Profile form component
  const ProfileForm = () => (
    <div className="profile-form">
      <h2>Create Your Profile</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        createProfile({
          name: formData.get('name'),
          needs: [
            {
              category: formData.get('needCategory'),
              description: formData.get('needDescription'),
              urgency: formData.get('needUrgency'),
              budget: formData.get('needBudget'),
              timeline: formData.get('needTimeline')
            }
          ],
          abilities: [
            {
              category: formData.get('abilityCategory'),
              description: formData.get('abilityDescription'),
              experience: formData.get('abilityExperience'),
              rate: formData.get('abilityRate'),
              availability: formData.get('abilityAvailability')
            }
          ],
          interests: formData.get('interests').split(',').map(i => i.trim())
        });
      }}>
        <div className="form-group">
          <label>Name:</label>
          <input name="name" required />
        </div>
        
        <div className="form-group">
          <label>What do you need help with?</label>
          <select name="needCategory" required>
            <option value="web-development">Web Development</option>
            <option value="ui-design">UI/UX Design</option>
            <option value="data-science">Data Science</option>
            <option value="marketing">Marketing</option>
            <option value="business">Business Strategy</option>
          </select>
          <textarea name="needDescription" placeholder="Describe your need..." required />
          <select name="needUrgency">
            <option value="normal">Normal</option>
            <option value="asap">ASAP</option>
            <option value="urgent">Urgent</option>
          </select>
          <input name="needBudget" placeholder="Budget range (e.g., 500-1000)" />
          <select name="needTimeline">
            <option value="flexible">Flexible</option>
            <option value="asap">ASAP</option>
            <option value="long-term">Long-term</option>
          </select>
        </div>

        <div className="form-group">
          <label>What can you help others with?</label>
          <select name="abilityCategory" required>
            <option value="web-development">Web Development</option>
            <option value="ui-design">UI/UX Design</option>
            <option value="data-science">Data Science</option>
            <option value="marketing">Marketing</option>
            <option value="business">Business Strategy</option>
          </select>
          <textarea name="abilityDescription" placeholder="Describe your skills..." required />
          <select name="abilityExperience">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <input name="abilityRate" placeholder="Rate range (e.g., 50-75)" />
          <select name="abilityAvailability">
            <option value="flexible">Flexible</option>
            <option value="part-time">Part-time</option>
            <option value="full-time">Full-time</option>
          </select>
        </div>

        <div className="form-group">
          <label>Interests (comma-separated):</label>
          <input name="interests" placeholder="react, design, ai, startups" required />
        </div>

        <button type="submit">Create Profile</button>
      </form>
    </div>
  );

  // Matches component
  const MatchesList = () => (
    <div className="matches-list">
      <h2>Your Matches</h2>
      {matches.map((match, index) => (
        <div key={index} className="match-card">
          <div className="match-header">
            <span className="user-avatar">{match.user.avatar}</span>
            <h3>{match.user.name}</h3>
            <span className="match-score">{Math.round(match.score * 100)}% match</span>
          </div>
          
          <p className="match-reason">{match.reason}</p>
          
          <div className="match-details">
            <div className="need-ability">
              <strong>Need:</strong> {match.need?.description || 'N/A'}
            </div>
            <div className="need-ability">
              <strong>Ability:</strong> {match.ability?.description || 'N/A'}
            </div>
          </div>

          <div className="suggestions">
            <h4>AI Suggestions:</h4>
            {match.suggestions.map((suggestion, idx) => (
              <div key={idx} className="suggestion">
                <strong>{suggestion.action}</strong>
                <p>{suggestion.description}</p>
                <span className={`priority ${suggestion.priority}`}>
                  {suggestion.priority} priority
                </span>
              </div>
            ))}
          </div>

          <div className="match-actions">
            <button onClick={() => createSession([currentUser.id, match.userId], 'Collaboration Discussion')}>
              Start AI Session
            </button>
            <button>Connect</button>
            <button>Schedule Meeting</button>
          </div>
        </div>
      ))}
    </div>
  );

  // Shared AI Session component
  const SharedSession = () => {
    const [message, setMessage] = useState('');

    if (!activeSession) return null;

    return (
      <div className="shared-session">
        <div className="session-header">
          <h2>AI Session: {activeSession.topic}</h2>
          <div className="participants">
            {activeSession.participants.map(id => {
              const user = socialAI.users.get(id);
              return (
                <span key={id} className="participant">
                  {user?.avatar} {user?.name}
                </span>
              );
            })}
          </div>
        </div>

        <div className="messages-container">
          {activeSession.messages.map((msg, index) => (
            <div key={index} className={`message ${msg.userId === currentUser?.id ? 'own' : 'other'}`}>
              <div className="message-header">
                <span className="user-avatar">{msg.user?.avatar}</span>
                <span className="user-name">{msg.user?.name}</span>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
              
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="ai-suggestions">
                  {msg.suggestions.map((suggestion, idx) => (
                    <button key={idx} className="suggestion-btn">
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="message-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && message.trim()) {
                sendMessage(message);
                setMessage('');
              }
            }}
          />
          <button onClick={() => {
            if (message.trim()) {
              sendMessage(message);
              setMessage('');
            }
          }}>
            Send
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="social-ai-page">
      <div className="social-ai-header">
        <h1>🤖 Social AI Matching</h1>
        <p>Connect with like-minded people through AI-powered matching and shared conversations</p>
      </div>

      <div className="social-ai-content">
        {!currentUser ? (
          <div className="welcome-section">
            <h2>Welcome to Social AI Matching</h2>
            <p>Create your profile to start connecting with people who can help you and whom you can help.</p>
            <button onClick={() => setShowProfileForm(true)}>Create Profile</button>
          </div>
        ) : (
          <div className="user-dashboard">
            <div className="user-info">
              <span className="user-avatar">{currentUser.avatar}</span>
              <h3>{currentUser.name}</h3>
              <div className="user-stats">
                <span>Connections: {socialAI?.getUserStats(currentUser.id)?.connections || 0}</span>
                <span>Sessions: {socialAI?.getUserStats(currentUser.id)?.sessions || 0}</span>
                <span>Matches: {socialAI?.getUserStats(currentUser.id)?.matches || 0}</span>
              </div>
            </div>

            <div className="dashboard-actions">
              <button onClick={findMatches}>Find Matches</button>
              <button onClick={() => setShowSessions(true)}>View Sessions</button>
              <button onClick={() => setShowProfileForm(true)}>Edit Profile</button>
            </div>

            {showProfileForm && <ProfileForm />}
            {showMatches && <MatchesList />}
            {showSessions && activeSession && <SharedSession />}
          </div>
        )}
      </div>
    </div>
  );
} 