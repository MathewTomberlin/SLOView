import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import './ChatInput.css';

const ChatInput: React.FC = () => {
  const { sendMessage, chatState } = useChat();
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !chatState.isLoading) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about the map..."
          className="chat-input-field"
          disabled={chatState.isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || chatState.isLoading}
          className="chat-send-button"
        >
          {chatState.isLoading ? (
            <div className="loading-spinner-small"></div>
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
