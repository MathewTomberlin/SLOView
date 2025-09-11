/**
 * Configuration for what data to include in map context for AI prompts
 * This allows fine-tuning what information is sent to the LLM
 */

export interface ContextFieldConfig {
  includeCoordinates: boolean;
  includeOsmId: boolean;
  includeGeometry: boolean;
  includeTypeDetails: boolean;
  includeName: boolean;
  includeAmenity: boolean;
  includeCuisine: boolean;
  includeBrand: boolean;
  includeContact: boolean;
  includeAddress: boolean;
  includeHours: boolean;
  includeAccessibility: boolean;
  maxItems: number;
}

export interface ContextConfig {
  // General context settings
  includeLocation: boolean;
  includeSearchRadius: boolean;
  includeLayerInfo: boolean;
  
  // Data field configurations
  restaurantFields: ContextFieldConfig;
  streetFields: ContextFieldConfig;
  poiFields: ContextFieldConfig;
  
  // Prompt structure settings
  useStructuredFormat: boolean;
  includeDataCount: boolean;
}

/**
 * Default configuration - conservative approach
 * Excludes coordinates and technical details that LLMs struggle with
 */
export const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  // General context
  includeLocation: true,
  includeSearchRadius: true,
  includeLayerInfo: true,
  
  // Restaurant data fields
  restaurantFields: {
    includeCoordinates: false,  // LLMs aren't great with coordinates
    includeOsmId: false,        // Technical ID not useful for users
    includeGeometry: false,     // Complex geometry data
    includeTypeDetails: true,   // amenity type is useful
    includeName: true,          // Names are essential
    includeAmenity: true,       // Restaurant type (fast_food, restaurant, cafe, etc.)
    includeCuisine: true,       // Cuisine type (italian, mexican, etc.)
    includeBrand: true,         // Brand names (McDonald's, Starbucks, etc.)
    includeContact: false,      // Phone, website - usually not needed for context
    includeAddress: false,      // Address details - usually not needed for context
    includeHours: false,        // Opening hours - usually not needed for context
    includeAccessibility: false, // Wheelchair access, etc. - usually not needed for context
    maxItems: 15                // Reasonable limit
  },
  
  // Street data fields
  streetFields: {
    includeCoordinates: false,
    includeOsmId: false,
    includeGeometry: false,
    includeTypeDetails: true,   // highway type is useful
    includeName: true,
    includeAmenity: false,      // Not relevant for streets
    includeCuisine: false,      // Not relevant for streets
    includeBrand: false,        // Not relevant for streets
    includeContact: false,      // Not relevant for streets
    includeAddress: false,      // Not relevant for streets
    includeHours: false,        // Not relevant for streets
    includeAccessibility: false, // Not relevant for streets
    maxItems: 20
  },
  
  // POI data fields
  poiFields: {
    includeCoordinates: false,
    includeOsmId: false,
    includeGeometry: false,
    includeTypeDetails: true,   // Categories are useful
    includeName: true,
    includeAmenity: true,       // POI types are useful
    includeCuisine: false,      // Only relevant for restaurants
    includeBrand: true,         // Brand names useful for POIs
    includeContact: false,      // Usually not needed for context
    includeAddress: false,      // Usually not needed for context
    includeHours: false,        // Usually not needed for context
    includeAccessibility: false, // Usually not needed for context
    maxItems: 15
  },
  
  // Prompt structure
  useStructuredFormat: true,
  includeDataCount: true
};

/**
 * Alternative configurations for different use cases
 */

// Configuration that includes coordinates (for advanced use cases)
export const COORDINATES_CONFIG: ContextConfig = {
  ...DEFAULT_CONTEXT_CONFIG,
  restaurantFields: { ...DEFAULT_CONTEXT_CONFIG.restaurantFields, includeCoordinates: true },
  streetFields: { ...DEFAULT_CONTEXT_CONFIG.streetFields, includeCoordinates: true },
  poiFields: { ...DEFAULT_CONTEXT_CONFIG.poiFields, includeCoordinates: true }
};

// Minimal configuration (names only)
export const MINIMAL_CONFIG: ContextConfig = {
  ...DEFAULT_CONTEXT_CONFIG,
  includeLocation: false,
  includeSearchRadius: false,
  restaurantFields: { 
    includeCoordinates: false, 
    includeOsmId: false, 
    includeGeometry: false, 
    includeTypeDetails: false, 
    includeName: true,
    includeAmenity: false,
    includeCuisine: false,
    includeBrand: false,
    includeContact: false,
    includeAddress: false,
    includeHours: false,
    includeAccessibility: false,
    maxItems: 10 
  },
  streetFields: { 
    includeCoordinates: false, 
    includeOsmId: false, 
    includeGeometry: false, 
    includeTypeDetails: false, 
    includeName: true,
    includeAmenity: false,
    includeCuisine: false,
    includeBrand: false,
    includeContact: false,
    includeAddress: false,
    includeHours: false,
    includeAccessibility: false,
    maxItems: 10 
  },
  poiFields: { 
    includeCoordinates: false, 
    includeOsmId: false, 
    includeGeometry: false, 
    includeTypeDetails: false, 
    includeName: true,
    includeAmenity: false,
    includeCuisine: false,
    includeBrand: false,
    includeContact: false,
    includeAddress: false,
    includeHours: false,
    includeAccessibility: false,
    maxItems: 10 
  }
};

// Detailed configuration (includes more technical details)
export const DETAILED_CONFIG: ContextConfig = {
  ...DEFAULT_CONTEXT_CONFIG,
  restaurantFields: { 
    includeCoordinates: false, 
    includeOsmId: true, 
    includeGeometry: false, 
    includeTypeDetails: true, 
    includeName: true,
    includeAmenity: true,
    includeCuisine: true,
    includeBrand: true,
    includeContact: true,
    includeAddress: true,
    includeHours: true,
    includeAccessibility: true,
    maxItems: 25 
  },
  streetFields: { 
    includeCoordinates: false, 
    includeOsmId: true, 
    includeGeometry: false, 
    includeTypeDetails: true, 
    includeName: true,
    includeAmenity: false,
    includeCuisine: false,
    includeBrand: false,
    includeContact: false,
    includeAddress: false,
    includeHours: false,
    includeAccessibility: false,
    maxItems: 30 
  },
  poiFields: { 
    includeCoordinates: false, 
    includeOsmId: true, 
    includeGeometry: false, 
    includeTypeDetails: true, 
    includeName: true,
    includeAmenity: true,
    includeCuisine: false,
    includeBrand: true,
    includeContact: true,
    includeAddress: true,
    includeHours: true,
    includeAccessibility: true,
    maxItems: 25 
  }
};

/**
 * Get the current context configuration
 * This is where you can easily switch between different configs
 */
export function getContextConfig(): ContextConfig {
  // For now, return the default config
  // Later this could be based on user preferences, prompt context, etc.
  return DEFAULT_CONTEXT_CONFIG;
  
  // Uncomment to use different configurations:
  // return COORDINATES_CONFIG;    // Include coordinates
  // return MINIMAL_CONFIG;        // Minimal data
  // return DETAILED_CONFIG;       // More technical details
}
