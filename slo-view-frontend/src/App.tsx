import React from 'react';
import Navbar from './components/Navbar/Navbar';
import MapViewer from './components/MapViewer/MapViewer';
import ChatSidebar from './components/ChatSidebar/ChatSidebar';
import ChatInput from './components/ChatInput/ChatInput';
import { ChatProvider } from './contexts/ChatContext';
import './App.css';

/**
 * Main App component for the SLO View application.
 * 
 * Renders the navigation bar, map viewer, and chat components.
 * The map viewer takes up the full space below the navigation bar.
 * Chat sidebar is positioned on the right side with input at the bottom.
 */
const App: React.FC = () => {
  return (
    <ChatProvider>
      <div className="App">
        <Navbar />
        <MapViewer />
        <ChatSidebar />
        <ChatInput />
      </div>
    </ChatProvider>
  );
};

export default App;
