import React from 'react';
import Navbar from './components/Navbar/Navbar';
import MapViewer from './components/MapViewer/MapViewer';
import './App.css';

/**
 * Main App component for the SLO View application.
 * 
 * Renders the navigation bar and map viewer components.
 * The map viewer takes up the full space below the navigation bar.
 */
const App: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <MapViewer />
    </div>
  );
};

export default App;
