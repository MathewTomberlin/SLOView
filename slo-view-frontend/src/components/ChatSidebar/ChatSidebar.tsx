import React, { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { createMapContextSummary } from '../../utils/contextFormatter';
import ChatMessage from '../ChatMessage/ChatMessage';
import './ChatSidebar.css';

const ChatSidebar: React.FC = () => {
  const { chatState, mapContext } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h3>Map Assistant</h3>
        <div className="chat-status">
          {chatState.isLoading && <span>AI is typing...</span>}
          {chatState.error && <span className="error">Error: {chatState.error}</span>}
        </div>
        {mapContext && (
          <div className="map-context-info">
            <small>{createMapContextSummary(mapContext)}</small>
          </div>
        )}
      </div>
      
      <div className="chat-messages">
        {chatState.messages.length === 0 ? (
          <div className="empty-state">
            <p>Ask me anything about the map!</p>
            <p>Try: "Show me restaurants near here" or "What's interesting in this area?"</p>
          </div>
        ) : (
          chatState.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {chatState.isLoading && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatSidebar;
