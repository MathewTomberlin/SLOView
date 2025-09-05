import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

/**
 * Unit tests for the Navbar component.
 * 
 * Tests that the navigation bar renders correctly with the expected title.
 */
describe('Navbar Component', () => {
  test('renders SLO View title', () => {
    render(<Navbar />);
    const titleElement = screen.getByText('SLO View');
    expect(titleElement).toBeInTheDocument();
  });

  test('has correct CSS class', () => {
    render(<Navbar />);
    const navbarElement = screen.getByRole('navigation');
    expect(navbarElement).toHaveClass('navbar');
  });

  test('title has correct CSS class', () => {
    render(<Navbar />);
    const titleElement = screen.getByText('SLO View');
    expect(titleElement).toHaveClass('navbar-title');
  });
});
