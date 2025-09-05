import React from 'react';
import './Navbar.css';

/**
 * Navigation bar component for the SLO View application.
 * 
 * Displays the site title "SLO View" in a fixed position at the top of the page.
 * Features a clean, responsive design with appropriate styling.
 */
const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">SLO View</h1>
      </div>
    </nav>
  );
};

export default Navbar;
