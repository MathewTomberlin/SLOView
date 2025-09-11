import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ChatMessage, ChatState } from '../types/chat';
import { MapContext } from '../utils/contextFormatter';
import geminiService from '../services/geminiService';

interface ChatContextType {
  chatState: ChatState;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  mapContext: MapContext | null;
  setMapContext: (context: MapContext | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  });

  const [mapContext, setMapContext] = useState<MapContext | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      const response = await geminiService.sendMessage(content, mapContext);
      
      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.text,
          sender: 'assistant',
          timestamp: new Date()
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      } else {
        setChatState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to get response'
        }));
      }
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [mapContext]);

  const clearChat = useCallback(() => {
    setChatState({
      messages: [],
      isLoading: false,
      error: null
    });
  }, []);

  return (
    <ChatContext.Provider value={{ chatState, sendMessage, clearChat, mapContext, setMapContext }}>
      {children}
    </ChatContext.Provider>
  );
};
