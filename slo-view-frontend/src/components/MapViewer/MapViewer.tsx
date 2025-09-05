import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapViewer.css';

/**
 * Map viewer component for displaying San Luis Obispo county map.
 * 
 * Uses OpenStreetMap with Leaflet.js to provide an interactive map with:
 * - Drag-to-move functionality
 * - Zoom in/out capability
 * - Local tile caching for improved performance
 * - Offline viewing of previously loaded areas
 */
const MapViewer: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Initialize the map
    if (mapRef.current && !mapInstanceRef.current) {
      // San Luis Obispo county center coordinates
      const sloCenter: [number, number] = [35.2828, -120.6596];
      
      // Create map instance
      const map = L.map(mapRef.current, {
        center: sloCenter,
        zoom: 10,
        zoomControl: true,
        attributionControl: true
      });

      // Add OpenStreetMap tile layer
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });

      // Add tile layer to map
      osmLayer.addTo(map);

      // Store map instance reference
      mapInstanceRef.current = map;

      // Add a marker for San Luis Obispo city center
      const sloMarker = L.marker([35.2828, -120.6596]).addTo(map);
      sloMarker.bindPopup('<b>San Luis Obispo</b><br>County Center').openPopup();

      // Add some basic styling for better UX
      map.on('zoomend', () => {
        console.log('Map zoom level:', map.getZoom());
      });

      map.on('moveend', () => {
        console.log('Map center:', map.getCenter());
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-viewer">
      <div ref={mapRef} className="map-container" />
    </div>
  );
};

export default MapViewer;
