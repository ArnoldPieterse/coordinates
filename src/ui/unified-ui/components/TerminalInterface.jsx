import React, { useState, useEffect, useRef } from 'react';
import { LLMManager, LLM_PROVIDERS } from '../../llm-integration.js';

const TerminalInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState({});
  const [streamingMessage, setStreamingMessage] = useState('');
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [settings, setSettings] = useState({
    maxTokens: 1024,
    temperature: 0.7,
    model: 'meta-llama-3-70b-instruct-smashed',
    streaming: true,
    autoScroll: true
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const llmManager = useRef(null);
  const terminalAccess = useRef(null);

  useEffect(() => {
    initializeTerminal();
    
    // Cleanup on unmount
    return () => {
      if (llmManager.current) {
        // Cleanup any ongoing processes
      }
    };
  }, []);

  useEffect(() => {
    if (settings.autoScroll) {
      scrollToBottom();
    }
  }, [messages, streamingMessage]);

  const initializeTerminal = async () => {
    try {
      console.log('🚀 Initializing Terminal Interface...');
      
      // Initialize LLM Manager
      llmManager.current = new LLMManager();
      await llmManager.current.initializeServices();
      
      // Get terminal access
      terminalAccess.current = llmManager.current.getTerminalAccess();
      
      if (terminalAccess.current) {
        setIsConnected(true);
        updateTerminalStatus();
        
        // Set up event listeners for terminal responses
        window.addEventListener('terminalResponse', handleTerminalResponse);
        window.addEventListener('terminalStreamingChunk', handleStreamingChunk);
        
        console.log('✅ Terminal Interface initialized successfully');
      } else {
        console.error('❌ Terminal access not available');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('❌ Failed to initialize terminal:', error);
      setIsConnected(false);
    }
  };

  const updateTerminalStatus = () => {
    if (terminalAccess.current) {
      const status = terminalAccess.current.getStatus();
      setTerminalStatus(status);
    }
  };

  const handleTerminalResponse = (event) => {
    const { messageId, response, timestamp } = event.detail;
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, response, status: 'completed', completedAt: timestamp }
        : msg
    ));
    
    setIsProcessing(false);
    setStreamingMessage('');
    setActiveMessageId(null);
    
    // Update status
    updateTerminalStatus();
  };

  const handleStreamingChunk = (event) => {
    const { messageId, chunk, timestamp } = event.detail;
    
    if (messageId === activeMessageId) {
      setStreamingMessage(prev => prev + chunk);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !isConnected || isProcessing) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newMessage = {
      id: messageId,
      content: inputMessage,
      timestamp: Date.now(),
      status: 'sending',
      response: '',
      settings: { ...settings }
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsProcessing(true);
    setActiveMessageId(messageId);
    setStreamingMessage('');

    try {
      if (terminalAccess.current) {
        // Send via terminal access
        await terminalAccess.current.sendMessage(inputMessage, {
          maxTokens: settings.maxTokens,
          temperature: settings.temperature,
          model: settings.model,
          streaming: settings.streaming
        });
      } else {
        // Fallback to regular LLM manager
        const response = await llmManager.current.generateResponse(inputMessage, {
          maxTokens: settings.maxTokens,
          temperature: settings.temperature,
          model: settings.model
        });
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, response: response.text, status: 'completed', completedAt: Date.now() }
            : msg
        ));
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'error', error: error.message }
          : msg
      ));
      setIsProcessing(false);
      setActiveMessageId(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearHistory = () => {
    setMessages([]);
    if (terminalAccess.current) {
      terminalAccess.current.clearHistory();
    }
  };

  const getConnectionStatusColor = () => {
    switch (terminalStatus.connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'error': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="terminal-interface">
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">🔌</span>
          <span>Terminal Access - LM Studio Local</span>
        </div>
        
        <div className="terminal-status">
          <span className={`status-indicator ${getConnectionStatusColor()}`}>
            ● {terminalStatus.connectionStatus || 'unknown'}
          </span>
          {terminalStatus.lastPing && (
            <span className="ping-info">
              Last ping: {formatTimestamp(terminalStatus.lastPing)}
            </span>
          )}
          {terminalStatus.queueLength > 0 && (
            <span className="queue-info">
              Queue: {terminalStatus.queueLength}
            </span>
          )}
        </div>
      </div>

      {/* Terminal Settings */}
      <div className="terminal-settings">
        <div className="settings-row">
          <div className="setting-group">
            <label>Model:</label>
            <select 
              value={settings.model} 
              onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
              disabled={isProcessing}
            >
              <option value="meta-llama-3-70b-instruct-smashed">Llama 3 70B</option>
              <option value="text-embedding-nomic-embed-text-v1.5@q4_k_m">Nomic Embed</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>Max Tokens:</label>
            <input 
              type="number" 
              value={settings.maxTokens} 
              onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
              min="1" 
              max="8192"
              disabled={isProcessing}
            />
          </div>
          
          <div className="setting-group">
            <label>Temperature:</label>
            <input 
              type="range" 
              value={settings.temperature} 
              onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              min="0" 
              max="2" 
              step="0.1"
              disabled={isProcessing}
            />
            <span className="temp-value">{settings.temperature}</span>
          </div>
          
          <div className="setting-group">
            <label>
              <input 
                type="checkbox" 
                checked={settings.streaming} 
                onChange={(e) => setSettings(prev => ({ ...prev, streaming: e.target.checked }))}
                disabled={isProcessing}
              />
              Streaming
            </label>
          </div>
          
          <div className="setting-group">
            <label>
              <input 
                type="checkbox" 
                checked={settings.autoScroll} 
                onChange={(e) => setSettings(prev => ({ ...prev, autoScroll: e.target.checked }))}
              />
              Auto-scroll
            </label>
          </div>
        </div>
      </div>

      {/* Terminal Messages */}
      <div className="terminal-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <div className="empty-text">No messages yet. Start a conversation with your local LM Studio!</div>
            <div className="empty-hint">Press Enter to send, Shift+Enter for new line</div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message-container ${message.status}`}>
            <div className="message-header">
              <span className="message-time">{formatTimestamp(message.timestamp)}</span>
              <span className={`message-status status-${message.status}`}>
                {message.status === 'sending' && '⏳ Sending...'}
                {message.status === 'processing' && '🔄 Processing...'}
                {message.status === 'completed' && '✅ Completed'}
                {message.status === 'error' && '❌ Error'}
              </span>
            </div>
            
            <div className="message-content">
              <div className="user-message">
                <span className="message-role">👤 You:</span>
                <div className="message-text">{message.content}</div>
              </div>
              
              {message.response && (
                <div className="assistant-message">
                  <span className="message-role">🤖 Assistant:</span>
                  <div className="message-text">{message.response}</div>
                </div>
              )}
              
              {message.error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{message.error}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Streaming message */}
        {streamingMessage && (
          <div className="message-container streaming">
            <div className="message-header">
              <span className="message-time">{formatTimestamp(Date.now())}</span>
              <span className="message-status status-streaming">🔄 Streaming...</span>
            </div>
            
            <div className="message-content">
              <div className="assistant-message">
                <span className="message-role">🤖 Assistant:</span>
                <div className="message-text streaming-text">
                  {streamingMessage}
                  <span className="streaming-cursor">|</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Terminal Input */}
      <div className="terminal-input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
            disabled={!isConnected || isProcessing}
            rows={3}
            className="terminal-input"
          />
          
          <div className="input-actions">
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !isConnected || isProcessing}
              className="send-button"
            >
              {isProcessing ? '⏳' : '🚀'} Send
            </button>
            
            <button
              onClick={clearHistory}
              disabled={messages.length === 0}
              className="clear-button"
            >
              🗑️ Clear
            </button>
            
            <button
              onClick={scrollToBottom}
              className="scroll-button"
            >
              📍 Bottom
            </button>
          </div>
        </div>
        
        <div className="input-status">
          {!isConnected && (
            <span className="status-error">❌ Not connected to LM Studio</span>
          )}
          {isProcessing && (
            <span className="status-processing">⏳ Processing message...</span>
          )}
          {isConnected && !isProcessing && (
            <span className="status-ready">✅ Ready to send</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalInterface; 