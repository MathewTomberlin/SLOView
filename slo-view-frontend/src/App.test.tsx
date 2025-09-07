import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the MapViewer component to avoid Leaflet DOM issues in tests
jest.mock('./components/MapViewer/MapViewer', () => {
  return function MockMapViewer() {
    return <div data-testid="map-viewer">Mock Map Viewer</div>;
  };
});

test('renders SLO View title', () => {
  render(<App />);
  const titleElement = screen.getByText('SLO View');
  expect(titleElement).toBeInTheDocument();
});

test('renders map viewer', () => {
  render(<App />);
  const mapViewer = screen.getByTestId('map-viewer');
  expect(mapViewer).toBeInTheDocument();
});
