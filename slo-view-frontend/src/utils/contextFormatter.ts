import { OSMPoint } from '../types/map';
import { ContextFieldConfig, getContextConfig } from '../config/contextConfig';

export interface MapContext {
  selectedLayer: string;
  centerPosition: [number, number];
  searchRadius: number;
  data: {
    restaurants?: OSMPoint[];
    streets?: OSMPoint[];
    pois?: OSMPoint[];
  };
}

/**
 * Formats OSM data into a structured context for AI prompts
 * Uses a "prompt sandwich" approach with clear context separation
 * Now configurable based on context configuration
 */
export function formatMapContextForPrompt(context: MapContext): string {
  if (context.selectedLayer === 'none' || !context.data) {
    return '';
  }

  const config = getContextConfig();
  const { selectedLayer, centerPosition, searchRadius, data } = context;
  const [lat, lon] = centerPosition;
  const radiusKm = (searchRadius / 1000).toFixed(1);

  let contextString = `\n\n--- MAP CONTEXT ---\n`;
  
  // Include location info if configured
  if (config.includeLocation) {
    contextString += `Location: San Luis Obispo County, CA (${lat.toFixed(4)}, ${lon.toFixed(4)})\n`;
  }
  
  // Include search radius if configured
  if (config.includeSearchRadius) {
    contextString += `Search Radius: ${radiusKm} km\n`;
  }
  
  // Include layer info if configured
  if (config.includeLayerInfo) {
    contextString += `Active Layer: ${selectedLayer}\n`;
  }
  
  contextString += `\n`;

  // Format data based on selected layer
  switch (selectedLayer) {
    case 'restaurants':
      if (data.restaurants && data.restaurants.length > 0) {
        const count = config.includeDataCount ? ` (${data.restaurants.length} found)` : '';
        contextString += `RESTAURANTS${count}:\n`;
        
        
        contextString += formatOSMPoints(data.restaurants, 'restaurant', config.restaurantFields);
      } else {
        contextString += `RESTAURANTS: No restaurants found in the search area.\n`;
      }
      break;

    case 'streets':
      if (data.streets && data.streets.length > 0) {
        const count = config.includeDataCount ? ` (${data.streets.length} found)` : '';
        contextString += `STREETS/ROADS${count}:\n`;
        contextString += formatOSMPoints(data.streets, 'street', config.streetFields);
      } else {
        contextString += `STREETS/ROADS: No streets found in the search area.\n`;
      }
      break;

    case 'pois':
      if (data.pois && data.pois.length > 0) {
        const count = config.includeDataCount ? ` (${data.pois.length} found)` : '';
        contextString += `POINTS OF INTEREST${count}:\n`;
        contextString += formatOSMPoints(data.pois, 'poi', config.poiFields);
      } else {
        contextString += `POINTS OF INTEREST: No POIs found in the search area.\n`;
      }
      break;
  }

  contextString += `\n--- END MAP CONTEXT ---\n`;
  return contextString;
}

/**
 * Formats OSM points into a readable table format
 * Now configurable based on field configuration
 */
function formatOSMPoints(
  points: OSMPoint[], 
  type: 'restaurant' | 'street' | 'poi', 
  fieldConfig: ContextFieldConfig
): string {
  if (points.length === 0) return '';

  let formatted = '';
  
  // Limit items based on configuration
  const limitedPoints = points.slice(0, fieldConfig.maxItems);
  
  limitedPoints.forEach((point, index) => {
    formatted += `${index + 1}. `;
    
    // Name (if configured to include)
    if (fieldConfig.includeName) {
      if (point.name && point.name.trim()) {
        formatted += `**${point.name}**`;
      } else {
        formatted += `*Unnamed ${type}*`;
      }
    }
    
    // Coordinates (if configured to include)
    if (fieldConfig.includeCoordinates) {
      formatted += ` (${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)})`;
    }
    
    // OSM ID (if configured to include)
    if (fieldConfig.includeOsmId) {
      formatted += ` [ID: ${point.osmId}]`;
    }
    
    // Type-specific information (if configured to include)
    if (fieldConfig.includeTypeDetails) {
      if (type === 'restaurant') {
        const details = [];
        
        
        // Basic type information
        if (point.type) details.push(`Type: ${point.type}`);
        
        // Amenity information (restaurant, fast_food, cafe, etc.)
        if (fieldConfig.includeAmenity && point.amenity) {
          details.push(`Category: ${point.amenity}`);
        }
        
        // Cuisine information
        if (fieldConfig.includeCuisine && point.cuisine) {
          details.push(`Cuisine: ${point.cuisine}`);
        }
        
        // Brand information
        if (fieldConfig.includeBrand && point.brand) {
          details.push(`Brand: ${point.brand}`);
        }
        
        if (details.length > 0) {
          formatted += ` - ${details.join(', ')}`;
        }
      } else if (type === 'street') {
        const details = [];
        if (point.highway) details.push(`Road Type: ${point.highway}`);
        if (point.type) details.push(`Classification: ${point.type}`);
        
        if (details.length > 0) {
          formatted += ` - ${details.join(', ')}`;
        }
      } else if (type === 'poi') {
        const categories = [];
        
        // Amenity information
        if (fieldConfig.includeAmenity && point.amenity) {
          categories.push(`Amenity: ${point.amenity}`);
        }
        
        // Other OSM categories
        if (point.tourism) categories.push(`Tourism: ${point.tourism}`);
        if (point.shop) categories.push(`Shop: ${point.shop}`);
        if (point.leisure) categories.push(`Leisure: ${point.leisure}`);
        if (point.natural) categories.push(`Natural: ${point.natural}`);
        
        // Brand information for POIs
        if (fieldConfig.includeBrand && point.brand) {
          categories.push(`Brand: ${point.brand}`);
        }
        
        if (categories.length > 0) {
          formatted += ` - ${categories.join(', ')}`;
        }
      }
    }
    
    formatted += '\n';
  });
  
  if (points.length > fieldConfig.maxItems) {
    formatted += `... and ${points.length - fieldConfig.maxItems} more items\n`;
  }
  
  return formatted;
}

/**
 * Creates a summary of the map context for quick reference
 * Now configurable based on context configuration
 */
export function createMapContextSummary(context: MapContext): string {
  if (context.selectedLayer === 'none') {
    return 'No map layer selected';
  }

  const config = getContextConfig();
  const { selectedLayer, centerPosition, searchRadius, data } = context;
  const [lat, lon] = centerPosition;
  const radiusKm = (searchRadius / 1000).toFixed(1);

  let summary = `Viewing ${selectedLayer}`;
  
  // Include location if configured
  if (config.includeLocation) {
    summary += ` within ${radiusKm}km of (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  } else {
    summary += ` within ${radiusKm}km radius`;
  }
  
  // Include item count if configured
  if (config.includeDataCount && data) {
    const count = data[selectedLayer as keyof typeof data]?.length || 0;
    summary += ` - ${count} items found`;
  }
  
  return summary;
}
