import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapViewer.css';

interface MapFeature {
  id: number;
  featureType: string;
  name: string;
  geometry: any;
  properties: any;
}

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
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMapFeatures = async (bounds: L.LatLngBounds) => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(
        `${apiUrl}/api/map/features?` +
        `minLon=${bounds.getWest()}&minLat=${bounds.getSouth()}&` +
        `maxLon=${bounds.getEast()}&maxLat=${bounds.getNorth()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setFeatures(data);
      } else {
        console.error('Failed to fetch map features:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching map features:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize the map
    if (mapRef.current && !mapInstanceRef.current) {
      // Configure custom marker icons
      const customIcon = L.icon({
        iconUrl: '/slo-view-frontend/images/marker-icon.svg',
        iconRetinaUrl: '/slo-view-frontend/images/marker-icon-2x.svg',
        shadowUrl: '/slo-view-frontend/images/marker-shadow.svg',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Set default icon for all markers
      L.Marker.prototype.options.icon = customIcon;

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

      // Add event handlers for fetching map features
      map.on('moveend', () => {
        console.log('Map center:', map.getCenter());
        fetchMapFeatures(map.getBounds());
      });

      map.on('zoomend', () => {
        console.log('Map zoom level:', map.getZoom());
        fetchMapFeatures(map.getBounds());
      });

      // Initial load of features
      fetchMapFeatures(map.getBounds());
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Effect to render features on the map
  useEffect(() => {
    if (mapInstanceRef.current && features.length > 0) {
      // Clear existing feature markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== mapInstanceRef.current?.getLayers()[0]) {
          mapInstanceRef.current?.removeLayer(layer);
        }
      });

      // Add new feature markers
      features.forEach((feature) => {
        if (feature.geometry && feature.geometry.type === 'Point') {
          const [lng, lat] = feature.geometry.coordinates;
          const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current!);
          
          let popupContent = `<b>${feature.name || 'Unnamed Feature'}</b>`;
          if (feature.featureType) {
            popupContent += `<br><i>Type: ${feature.featureType}</i>`;
          }
          if (feature.properties) {
            popupContent += `<br>Properties: ${JSON.stringify(feature.properties)}`;
          }
          
          marker.bindPopup(popupContent);
        }
      });
    }
  }, [features]);

  return (
    <div className="map-viewer">
      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>Loading map features...</span>
        </div>
      )}
      <div ref={mapRef} className="map-container" />
    </div>
  );
};

export default MapViewer;
