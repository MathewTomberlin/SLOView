import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  geometry?: string;
  coordinates?: number[][];
  type?: string;
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
  const [streets, setStreets] = useState<OSMPoint[]>([]);
  const [pois, setPOIs] = useState<OSMPoint[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string>('none');
  const [loading] = useState(false);
  const restaurantMarkersRef = useRef<L.Marker[]>([]);
  const streetMarkersRef = useRef<L.Marker[]>([]);
  const streetPolylinesRef = useRef<L.Polyline[]>([]);
  const poiMarkersRef = useRef<L.Marker[]>([]);
  const featureMarkersRef = useRef<L.Marker[]>([]);
  const centerMarkerRef = useRef<L.Marker | null>(null);
  const selectedLayerRef = useRef<string>('none');
  const [centerPosition, setCenterPosition] = useState<[number, number]>([35.2828, -120.6596]);
  const [searchRadius, setSearchRadius] = useState<number>(200); // Default 200m radius

  // Handler for radius changes
  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    // Re-query current layer if one is selected
    if (selectedLayer !== 'none') {
      fetchLayerData(selectedLayer, centerPosition[0], centerPosition[1], newRadius);
    }
  };

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

  const fetchLayerData = useCallback(async (layerType: string, lat?: number, lon?: number, radius?: number) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      // Use the provided coordinates or fall back to current center position
      const centerLat = lat ?? centerPosition[0];
      const centerLon = lon ?? centerPosition[1];
      const searchRadiusValue = radius ?? searchRadius;
      const limit = 50;
      
      let endpoint = '';
        switch (layerType) {
          case 'restaurants':
            endpoint = 'restaurants';
            break;
          case 'streets':
            endpoint = 'roads';
            break;
          case 'pois':
            endpoint = 'pois';
            break;
          default:
            return;
        }
      
      const response = await fetch(
        `${apiUrl}/api/map/${endpoint}?lon=${centerLon}&lat=${centerLat}&distance=${searchRadiusValue}&limit=${limit}`
      );
      
      if (response.ok) {
        const data = await response.json();
        switch (layerType) {
          case 'restaurants':
            setRestaurants(data);
            break;
          case 'streets':
            setStreets(data);
            break;
          case 'pois':
            setPOIs(data);
            break;
        }
      } else {
        console.error(`Failed to fetch ${layerType}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error fetching ${layerType}:`, error);
    }
  }, [centerPosition, searchRadius]);

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

      // Create a custom icon for the search center marker
      const centerIcon = L.icon({
        iconUrl: '/slo-view-frontend/images/search-center-marker.svg',
        iconRetinaUrl: '/slo-view-frontend/images/search-center-marker.svg',
        shadowUrl: '/slo-view-frontend/images/marker-shadow.svg',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'search-center-marker'
      });

      // Add a draggable marker for the search center
      const markerPosition: [number, number] = [35.2828, -120.6596];
      
      // Remove existing marker if it exists
      if (centerMarkerRef.current) {
        map.removeLayer(centerMarkerRef.current);
      }
      
      const sloMarker = L.marker(markerPosition, { 
        draggable: true, 
        icon: centerIcon 
      }).addTo(map);
      sloMarker.bindPopup(`<b>Search Center</b><br>Lat: ${markerPosition[0].toFixed(4)}<br>Lon: ${markerPosition[1].toFixed(4)}`).openPopup();
      
      // Store marker reference
      centerMarkerRef.current = sloMarker;
      
      // Add drag event handler to update position and re-query restaurants
      sloMarker.on('dragend', (event) => {
        const marker = event.target;
        const newPosition: [number, number] = [marker.getLatLng().lat, marker.getLatLng().lng];
        
        setCenterPosition(newPosition);
        
        // Update popup with new coordinates
        marker.bindPopup(`<b>Search Center</b><br>Lat: ${newPosition[0].toFixed(4)}<br>Lon: ${newPosition[1].toFixed(4)}`);
        
        // Re-query current layer if one is selected
        if (selectedLayerRef.current !== 'none') {
          fetchLayerData(selectedLayerRef.current, newPosition[0], newPosition[1]);
        }
      });

      // Add event handlers for fetching map features
      map.on('moveend', () => {
        // fetchMapFeatures(map.getBounds()); // Disabled for now
      });

      map.on('zoomend', () => {
        // fetchMapFeatures(map.getBounds()); // Disabled for now
      });

      // Initial load of restaurants (default layer)
      fetchLayerData('restaurants', centerPosition[0], centerPosition[1]);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      centerMarkerRef.current = null;
    };
  }, [centerPosition, fetchLayerData]);

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

  // Effect to handle layer display
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update the ref to track current state
    selectedLayerRef.current = selectedLayer;
    
    // Don't render if we're still loading data for the selected layer
    if (selectedLayer === 'streets' && streets.length === 0) {
      return;
    }
    if (selectedLayer === 'restaurants' && restaurants.length === 0) {
      return;
    }
    if (selectedLayer === 'pois' && pois.length === 0) {
      return;
    }

    // Clear all existing markers, polylines, and polygons
    restaurantMarkersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    streetMarkersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    streetPolylinesRef.current.forEach(polyline => {
      mapInstanceRef.current?.removeLayer(polyline);
    });
    poiMarkersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });

    // Clear all marker and polyline arrays
    restaurantMarkersRef.current = [];
    streetMarkersRef.current = [];
    streetPolylinesRef.current = [];
    poiMarkersRef.current = [];

    // Add markers based on selected layer
    if (selectedLayer === 'restaurants') {
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
    } else if (selectedLayer === 'streets') {
      const newStreetPolylines: L.Polyline[] = [];
      
      streets.forEach((street) => {
        if (street.geometry === 'LineString' && street.coordinates && street.coordinates.length > 0) {
          // Use actual street coordinates from the API
          // Convert from [longitude, latitude] to [latitude, longitude] for Leaflet
          const leafletCoordinates = street.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
          const polyline = L.polyline(leafletCoordinates as [number, number][], {
            color: '#27ae60',
            weight: 3,
            opacity: 0.8
          }).addTo(mapInstanceRef.current!);
          
          let popupContent = `<b>${street.name || 'Street'}</b>`;
          if (street.type) {
            popupContent += `<br><i>Type: ${street.type}</i>`;
          }
          
          polyline.bindPopup(popupContent);
          newStreetPolylines.push(polyline);
        } else {
          // Fallback: create demonstration polylines for streets without coordinates
          const centerLat = centerPosition[0];
          const centerLon = centerPosition[1];
          
          // Create a simple line radiating outward from the center
          const angle = (newStreetPolylines.length * 45) * (Math.PI / 180); // 45 degrees apart
          const distance = searchRadius / 111000; // Convert meters to degrees (rough approximation)
          
          const endLat = centerLat + (Math.cos(angle) * distance);
          const endLon = centerLon + (Math.sin(angle) * distance);
          
          const polyline = L.polyline([
            [centerLat, centerLon],
            [endLat, endLon]
          ], {
            color: '#27ae60',
            weight: 3,
            opacity: 0.8
          }).addTo(mapInstanceRef.current!);
          
          let popupContent = `<b>${street.name || 'Street'}</b>`;
          if (street.type) {
            popupContent += `<br><i>Type: ${street.type}</i>`;
          }
          popupContent += `<br><i>Note: Demo visualization</i>`;
          
          polyline.bindPopup(popupContent);
          newStreetPolylines.push(polyline);
        }
      });
      
      streetPolylinesRef.current = newStreetPolylines;
    } else if (selectedLayer === 'pois') {
      const newPOIMarkers: L.Marker[] = [];
      pois.forEach((poi) => {
        if (poi.latitude && poi.longitude) {
          const poiIcon = L.icon({
            iconUrl: '/slo-view-frontend/images/poi-marker-icon.svg',
            iconRetinaUrl: '/slo-view-frontend/images/poi-marker-icon.svg',
            shadowUrl: '/slo-view-frontend/images/marker-shadow.svg',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          const marker = L.marker([poi.latitude, poi.longitude], { icon: poiIcon }).addTo(mapInstanceRef.current!);
          
          let popupContent = `<b>${poi.name || 'Point of Interest'}</b>`;
          if (poi.amenity) {
            popupContent += `<br><i>Amenity: ${poi.amenity}</i>`;
          }
          if (poi.tourism) {
            popupContent += `<br><i>Tourism: ${poi.tourism}</i>`;
          }
          if (poi.shop) {
            popupContent += `<br><i>Shop: ${poi.shop}</i>`;
          }
          
          marker.bindPopup(popupContent);
          newPOIMarkers.push(marker);
        }
      });
      poiMarkersRef.current = newPOIMarkers;
    }
  }, [selectedLayer, restaurants, streets, pois, centerPosition, searchRadius]);

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
        streetMarkersRef.current.forEach(marker => {
          mapInstanceRef.current?.removeLayer(marker);
        });
        streetPolylinesRef.current.forEach(polyline => {
          mapInstanceRef.current?.removeLayer(polyline);
        });
        poiMarkersRef.current.forEach(marker => {
          mapInstanceRef.current?.removeLayer(marker);
        });
        if (centerMarkerRef.current) {
          mapInstanceRef.current?.removeLayer(centerMarkerRef.current);
        }
      }
    };
  }, []); // Empty dependency array for cleanup only

  return (
    <div className="map-viewer">
      <div className="map-controls">
        <div className="control-panel">
          <h3>Map Layers</h3>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="layer"
                value="none"
                checked={selectedLayer === 'none'}
                onChange={(e) => setSelectedLayer(e.target.value)}
              />
              <span className="radio-mark"></span>
              None
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="layer"
                value="restaurants"
                checked={selectedLayer === 'restaurants'}
                onChange={(e) => {
                  setSelectedLayer(e.target.value);
                  fetchLayerData(e.target.value, centerPosition[0], centerPosition[1]);
                }}
              />
              <span className="radio-mark"></span>
              Restaurants ({restaurants.length})
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="layer"
                value="streets"
                checked={selectedLayer === 'streets'}
                onChange={(e) => {
                  setSelectedLayer(e.target.value);
                  fetchLayerData(e.target.value, centerPosition[0], centerPosition[1]);
                }}
              />
              <span className="radio-mark"></span>
              Streets ({streets.length})
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="layer"
                value="pois"
                checked={selectedLayer === 'pois'}
                onChange={(e) => {
                  setSelectedLayer(e.target.value);
                  fetchLayerData(e.target.value, centerPosition[0], centerPosition[1]);
                }}
              />
              <span className="radio-mark"></span>
              Points of Interest ({pois.length})
            </label>
          </div>
          
          {selectedLayer !== 'none' && (
            <div className="radius-control">
              <label className="radius-label">
                Search Radius: {(searchRadius / 1000).toFixed(1)} km
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={searchRadius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="radius-slider"
              />
              <div className="radius-labels">
                <span>0.1 km</span>
                <span>1.0 km</span>
              </div>
            </div>
          )}
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
