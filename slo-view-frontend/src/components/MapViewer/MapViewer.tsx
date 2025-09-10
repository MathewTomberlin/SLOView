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

interface OSMPoint {
  osmId: number;
  name: string;
  amenity: string;
  tourism: string;
  shop: string;
  highway: string;
  natural: string;
  leisure: string;
  longitude: number;
  latitude: number;
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
  const [features] = useState<MapFeature[]>([]);
  const [restaurants, setRestaurants] = useState<OSMPoint[]>([]);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [loading] = useState(false);
  const restaurantMarkersRef = useRef<L.Marker[]>([]);
  const featureMarkersRef = useRef<L.Marker[]>([]);

  // const fetchMapFeatures = async (bounds: L.LatLngBounds) => {
  //   try {
  //     setLoading(true);
  //     const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  //     const response = await fetch(
  //       `${apiUrl}/api/map/points?` +
  //       `minLon=${bounds.getWest()}&minLat=${bounds.getSouth()}&` +
  //       `maxLon=${bounds.getEast()}&maxLat=${bounds.getNorth()}`
  //     );
  //     
  //     if (response.ok) {
  //       const data = await response.json();
  //       setFeatures(data);
  //     } else {
  //       console.error('Failed to fetch map features:', response.statusText);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching map features:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchRestaurants = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      // Use the new location-based restaurants endpoint
      const centerLon = -120.6596;
      const centerLat = 35.2828;
      const radius = 1000; // 1km radius
      const limit = 50;
      
      const response = await fetch(
        `${apiUrl}/api/map/restaurants?lon=${centerLon}&lat=${centerLat}&distance=${radius}&limit=${limit}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data);
      } else {
        console.error('Failed to fetch restaurants:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
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

      // Configure restaurant icon (currently using same as custom icon)
      // const restaurantIcon = L.icon({
      //   iconUrl: '/slo-view-frontend/images/marker-icon.svg',
      //   iconRetinaUrl: '/slo-view-frontend/images/marker-icon-2x.svg',
      //   shadowUrl: '/slo-view-frontend/images/marker-shadow.svg',
      //   iconSize: [25, 41],
      //   iconAnchor: [12, 41],
      //   popupAnchor: [1, -34],
      //   shadowSize: [41, 41]
      // });

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
        // fetchMapFeatures(map.getBounds()); // Disabled for now
      });

      map.on('zoomend', () => {
        // fetchMapFeatures(map.getBounds()); // Disabled for now
      });

      // Initial load of restaurants
      fetchRestaurants();
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
      featureMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });

      // Add new feature markers
      const newFeatureMarkers: L.Marker[] = [];
      features.forEach((feature: any) => {
        // Handle OSMPoint data structure
        if (feature.latitude && feature.longitude) {
          const marker = L.marker([feature.latitude, feature.longitude]).addTo(mapInstanceRef.current!);
          
          let popupContent = `<b>${feature.name || 'Unnamed Feature'}</b>`;
          if (feature.amenity) {
            popupContent += `<br><i>Type: ${feature.amenity}</i>`;
          }
          if (feature.tourism) {
            popupContent += `<br><i>Tourism: ${feature.tourism}</i>`;
          }
          if (feature.shop) {
            popupContent += `<br><i>Shop: ${feature.shop}</i>`;
          }
          
          marker.bindPopup(popupContent);
          newFeatureMarkers.push(marker);
        }
      });
      featureMarkersRef.current = newFeatureMarkers;
    } else {
      featureMarkersRef.current = [];
    }
  }, [features]);

  // Effect to handle restaurant display toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (showRestaurants) {
      // Add restaurant markers
      const newRestaurantMarkers: L.Marker[] = [];
      restaurants.forEach((restaurant) => {
        if (restaurant.latitude && restaurant.longitude) {
          const marker = L.marker([restaurant.latitude, restaurant.longitude]).addTo(mapInstanceRef.current!);
          
          let popupContent = `<b>${restaurant.name || 'Restaurant'}</b>`;
          if (restaurant.amenity) {
            popupContent += `<br><i>Type: ${restaurant.amenity}</i>`;
          }
          
          marker.bindPopup(popupContent);
          newRestaurantMarkers.push(marker);
        }
      });
      restaurantMarkersRef.current = newRestaurantMarkers;
    } else {
      // Remove restaurant markers
      restaurantMarkersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      restaurantMarkersRef.current = [];
    }
  }, [showRestaurants, restaurants]);

  // Cleanup effect for markers
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        featureMarkersRef.current.forEach(marker => {
          mapInstanceRef.current?.removeLayer(marker);
        });
        restaurantMarkersRef.current.forEach(marker => {
          mapInstanceRef.current?.removeLayer(marker);
        });
      }
    };
  }, []); // Empty dependency array for cleanup only

  return (
    <div className="map-viewer">
      <div className="map-controls">
        <div className="control-panel">
          <h3>Map Layers</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showRestaurants}
              onChange={(e) => setShowRestaurants(e.target.checked)}
            />
            <span className="checkmark"></span>
            Show Restaurants ({restaurants.length})
          </label>
        </div>
      </div>
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
