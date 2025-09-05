import React from 'react';
import { render } from '@testing-library/react';
import MapViewer from './MapViewer';

// Mock Leaflet completely to avoid DOM issues in tests
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn(),
    addLayer: jest.fn(),
    remove: jest.fn(),
    on: jest.fn(),
    getZoom: jest.fn(() => 10),
    getCenter: jest.fn(() => ({ lat: 35.2828, lng: -120.6596 }))
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn()
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(() => ({
      openPopup: jest.fn()
    }))
  }))
}));

/**
 * Unit tests for the MapViewer component.
 * 
 * Tests that the map viewer renders correctly and initializes the map.
 */
describe('MapViewer Component', () => {
  test('renders map container', () => {
    const { container } = render(<MapViewer />);
    const mapContainer = container.querySelector('.map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  test('has correct CSS class', () => {
    const { container } = render(<MapViewer />);
    const mapViewer = container.querySelector('.map-viewer');
    expect(mapViewer).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    expect(() => render(<MapViewer />)).not.toThrow();
  });
});
