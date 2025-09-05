import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SLO View title', () => {
  render(<App />);
  const titleElement = screen.getByText('SLO View');
  expect(titleElement).toBeInTheDocument();
});

test('renders map viewer', () => {
  render(<App />);
  const mapContainer = document.querySelector('.map-container');
  expect(mapContainer).toBeInTheDocument();
});
