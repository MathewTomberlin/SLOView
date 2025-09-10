package com.sloview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Service for making API calls to the SLO GIS FastAPI on the VM.
 * 
 * This service handles all communication with the remote PostGIS API,
 * transforming the GeoJSON responses into the format expected by the frontend.
 */
@Service
public class GISApiService {
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${gis.api.base-url:http://34.83.60.201}")
    private String gisApiBaseUrl;
    
    // Cache for restaurant data
    private List<Map<String, Object>> cachedRestaurants = new ArrayList<>();
    private boolean cacheInitialized = false;
    
    public GISApiService() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB
                .build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Initialize cache on startup
     */
    @PostConstruct
    public void initializeCache() {
        loadRestaurantsInBackground();
    }
    
    /**
     * Load restaurants in the background to avoid blocking startup
     */
    @Async
    public CompletableFuture<Void> loadRestaurantsInBackground() {
        try {
            // Wait a bit before making the first request to avoid rate limiting
            Thread.sleep(2000);
            
            List<Map<String, Object>> restaurants = fetchAllRestaurantsWithPagination();
            synchronized (this) {
                this.cachedRestaurants = restaurants;
                this.cacheInitialized = true;
            }
            System.out.println("Loaded " + restaurants.size() + " restaurants into cache");
        } catch (Exception e) {
            System.err.println("Failed to load restaurants into cache: " + e.getMessage());
            synchronized (this) {
                this.cacheInitialized = true; // Mark as initialized even if failed
            }
        }
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * Refresh cache every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void refreshCache() {
        loadRestaurantsInBackground();
    }
    
    /**
     * Fetches restaurants from cache or API.
     * 
     * @param limit Maximum number of restaurants to return (null for all)
     * @return List of restaurant data in frontend-compatible format
     */
    public List<Map<String, Object>> getRestaurants(Integer limit) {
        synchronized (this) {
            if (cacheInitialized && !cachedRestaurants.isEmpty()) {
                // Return cached data
                if (limit != null && limit < cachedRestaurants.size()) {
                    return new ArrayList<>(cachedRestaurants.subList(0, limit));
                }
                return new ArrayList<>(cachedRestaurants);
            }
        }
        
        // If cache is not ready, try to fetch a small amount directly
        // Use a very conservative approach to avoid rate limiting
        try {
            // Wait a bit to avoid rate limiting
            Thread.sleep(1000);
            
            int pageSize = limit != null ? Math.min(limit, 10) : 10; // Very small page size
            String url = gisApiBaseUrl + "/api/v1/restaurants?page=1&limit=" + pageSize;
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            return transformRestaurantsResponse(response);
        } catch (Exception e) {
            System.err.println("Warning: Failed to fetch restaurants from GIS API: " + e.getMessage());
            // Return some sample data if API fails
            return getSampleRestaurants(limit);
        }
    }
    
    /**
     * Returns sample restaurant data when API is unavailable
     */
    private List<Map<String, Object>> getSampleRestaurants(Integer limit) {
        List<Map<String, Object>> sampleRestaurants = new ArrayList<>();
        
        // Sample restaurants in San Luis Obispo area
        sampleRestaurants.add(createSampleRestaurant(1L, "Sample Restaurant 1", "restaurant", 35.2828, -120.6596));
        sampleRestaurants.add(createSampleRestaurant(2L, "Sample Restaurant 2", "fast_food", 35.2900, -120.6500));
        sampleRestaurants.add(createSampleRestaurant(3L, "Sample Restaurant 3", "bar", 35.2700, -120.6700));
        sampleRestaurants.add(createSampleRestaurant(4L, "Sample Restaurant 4", "restaurant", 35.3000, -120.6400));
        sampleRestaurants.add(createSampleRestaurant(5L, "Sample Restaurant 5", "fast_food", 35.2600, -120.6800));
        
        if (limit != null && limit < sampleRestaurants.size()) {
            return sampleRestaurants.subList(0, limit);
        }
        return sampleRestaurants;
    }
    
    private Map<String, Object> createSampleRestaurant(Long id, String name, String amenity, double lat, double lon) {
        Map<String, Object> restaurant = new HashMap<>();
        restaurant.put("osmId", id);
        restaurant.put("name", name);
        restaurant.put("amenity", amenity);
        restaurant.put("latitude", lat);
        restaurant.put("longitude", lon);
        restaurant.put("tourism", null);
        restaurant.put("shop", null);
        restaurant.put("highway", null);
        restaurant.put("natural", null);
        restaurant.put("leisure", null);
        return restaurant;
    }
    
    /**
     * Fetches all restaurants with pagination (used for cache loading)
     */
    private List<Map<String, Object>> fetchAllRestaurantsWithPagination() {
        List<Map<String, Object>> allRestaurants = new ArrayList<>();
        int page = 1;
        int pageSize = 10; // Very small page size to respect rate limits
        boolean hasMoreData = true;
        
        while (hasMoreData) {
            try {
                String url = gisApiBaseUrl + "/api/v1/restaurants?page=" + page + "&limit=" + pageSize;
                
                String response = webClient.get()
                        .uri(url)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();
                
                List<Map<String, Object>> pageRestaurants = transformRestaurantsResponse(response);
                
                if (pageRestaurants.isEmpty()) {
                    hasMoreData = false;
                } else {
                    allRestaurants.addAll(pageRestaurants);
                    page++;
                    
                    // Add delay between requests to respect rate limits
                    Thread.sleep(500); // 500ms delay between requests
                }
            } catch (Exception e) {
                System.err.println("Error fetching page " + page + ": " + e.getMessage());
                hasMoreData = false;
            }
        }
        
        return allRestaurants;
    }
    
    
    /**
     * Transforms the GeoJSON response from the GIS API into the format expected by the frontend.
     * 
     * @param jsonResponse Raw JSON response from the GIS API
     * @return Transformed list of restaurant data
     */
    private List<Map<String, Object>> transformRestaurantsResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode features = root.path("data").path("features");
            
            List<Map<String, Object>> restaurants = new ArrayList<>();
            
            for (JsonNode feature : features) {
                Map<String, Object> restaurant = new HashMap<>();
                
                // Extract ID
                restaurant.put("osmId", Long.parseLong(feature.path("id").asText()));
                
                // Extract properties
                JsonNode properties = feature.path("properties");
                restaurant.put("name", properties.path("name").asText());
                restaurant.put("amenity", properties.path("type").asText());
                
                // Extract coordinates and transform from 3857 to 4326
                JsonNode geometry = feature.path("geometry");
                JsonNode coordinates = geometry.path("coordinates");
                if (coordinates.isArray() && coordinates.size() >= 2) {
                    double x = coordinates.get(0).asDouble();
                    double y = coordinates.get(1).asDouble();
                    
                    // Transform from Web Mercator (3857) to WGS84 (4326)
                    double[] wgs84 = transformToWGS84(x, y);
                    restaurant.put("longitude", wgs84[0]);
                    restaurant.put("latitude", wgs84[1]);
                }
                
                // Set other fields to null for compatibility
                restaurant.put("tourism", null);
                restaurant.put("shop", null);
                restaurant.put("highway", null);
                restaurant.put("natural", null);
                restaurant.put("leisure", null);
                
                restaurants.add(restaurant);
            }
            
            return restaurants;
        } catch (Exception e) {
            throw new RuntimeException("Failed to transform restaurants response", e);
        }
    }
    
    
    /**
     * Fetches spatial summary from the GIS API.
     * 
     * @return Spatial summary data
     */
    public Map<String, Object> getSpatialSummary() {
        try {
            // Wait a bit to avoid rate limiting
            Thread.sleep(1000);
            
            String url = gisApiBaseUrl + "/api/v1/spatial/summary";
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            return transformSpatialSummaryResponse(response);
        } catch (Exception e) {
            System.err.println("Warning: Failed to fetch spatial summary from GIS API: " + e.getMessage());
            return getSampleSpatialSummary();
        }
    }
    
    /**
     * Finds nearby features using the optimized spatial search.
     * 
     * @param lon Longitude
     * @param lat Latitude
     * @param distance Search distance in meters
     * @param table Table to search (default: mv_restaurants)
     * @param limit Maximum number of results
     * @return List of nearby features
     */
    public List<Map<String, Object>> findNearbyFeatures(double lon, double lat, double distance, String table, Integer limit) {
        try {
            // Wait a bit to avoid rate limiting
            Thread.sleep(1000);
            
            // Use a reasonable default limit if none specified
            int effectiveLimit = limit != null ? limit : 50;
            String url = gisApiBaseUrl + "/api/v1/spatial/optimized/nearby" +
                    "?lon=" + lon + "&lat=" + lat + "&distance=" + distance + 
                    "&table=" + table + "&limit=" + effectiveLimit;
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            return transformNearbyFeaturesResponse(response);
        } catch (Exception e) {
            System.err.println("Warning: Failed to fetch nearby features from GIS API: " + e.getMessage());
            return getSampleNearbyFeatures(limit);
        }
    }
    
    /**
     * Fetches data status from the GIS API.
     * 
     * @return Data status information
     */
    public Map<String, Object> getDataStatus() {
        try {
            // Wait a bit to avoid rate limiting
            Thread.sleep(1000);
            
            String url = gisApiBaseUrl + "/api/v1/data/status";
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            return transformDataStatusResponse(response);
        } catch (Exception e) {
            System.err.println("Warning: Failed to fetch data status from GIS API: " + e.getMessage());
            return getSampleDataStatus();
        }
    }
    
    /**
     * Fetches data metadata from the GIS API.
     * 
     * @return Data metadata information
     */
    public Map<String, Object> getDataMetadata() {
        try {
            // Wait a bit to avoid rate limiting
            Thread.sleep(1000);
            
            String url = gisApiBaseUrl + "/api/v1/data/metadata";
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            return transformDataMetadataResponse(response);
        } catch (Exception e) {
            System.err.println("Warning: Failed to fetch data metadata from GIS API: " + e.getMessage());
            return getSampleDataMetadata();
        }
    }
    
    /**
     * Returns sample spatial summary data when API is unavailable
     */
    private Map<String, Object> getSampleSpatialSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("restaurants", 710);
        summary.put("roads", 54534);
        summary.put("pois", 3629);
        return summary;
    }
    
    /**
     * Returns sample nearby features data when API is unavailable
     */
    private List<Map<String, Object>> getSampleNearbyFeatures(Integer limit) {
        List<Map<String, Object>> features = new ArrayList<>();
        
        // Sample nearby features
        features.add(createSampleNearbyFeature(1L, "Sample Restaurant", "restaurant", 35.2828, -120.6596, 0.0));
        features.add(createSampleNearbyFeature(2L, "Sample POI", "atm", 35.2830, -120.6598, 25.5));
        
        if (limit != null && limit < features.size()) {
            return features.subList(0, limit);
        }
        return features;
    }
    
    /**
     * Returns sample data status when API is unavailable
     */
    private Map<String, Object> getSampleDataStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("database", Map.of("status", "healthy", "database_size", "591 MB"));
        status.put("record_counts", Map.of("restaurants", 710, "roads", 54534, "pois", 3629));
        status.put("health", "healthy");
        return status;
    }
    
    /**
     * Returns sample data metadata when API is unavailable
     */
    private Map<String, Object> getSampleDataMetadata() {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("layers", List.of(
            Map.of("name", "restaurants", "description", "Restaurant locations", "geometry_type", "point"),
            Map.of("name", "roads", "description", "Road network", "geometry_type", "linestring"),
            Map.of("name", "pois", "description", "Points of Interest", "geometry_type", "point")
        ));
        metadata.put("coordinate_systems", List.of("EPSG:3857", "EPSG:4326"));
        return metadata;
    }
    
    private Map<String, Object> createSampleNearbyFeature(Long id, String name, String type, double lat, double lon, double distance) {
        Map<String, Object> feature = new HashMap<>();
        feature.put("osmId", id);
        feature.put("name", name);
        feature.put("type", type);
        feature.put("latitude", lat);
        feature.put("longitude", lon);
        feature.put("distance", distance);
        feature.put("geometry", "Point");
        return feature;
    }
    
    /**
     * Transforms the spatial summary response from the GIS API.
     * 
     * @param jsonResponse Raw JSON response from the GIS API
     * @return Transformed spatial summary data
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> transformSpatialSummaryResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            return (Map<String, Object>) objectMapper.convertValue(root.path("data"), Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to transform spatial summary response", e);
        }
    }
    
    /**
     * Transforms the nearby features response from the GIS API.
     * 
     * @param jsonResponse Raw JSON response from the GIS API
     * @return Transformed list of nearby features
     */
    private List<Map<String, Object>> transformNearbyFeaturesResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode features = root.path("data").path("features");
            
            List<Map<String, Object>> nearbyFeatures = new ArrayList<>();
            
            for (JsonNode feature : features) {
                Map<String, Object> nearbyFeature = new HashMap<>();
                
                // Extract ID
                String idStr = feature.path("id").asText();
                if (!idStr.isEmpty()) {
                    nearbyFeature.put("osmId", Long.parseLong(idStr));
                } else {
                    nearbyFeature.put("osmId", 0L);
                }
                
                // Extract properties
                JsonNode properties = feature.path("properties");
                nearbyFeature.put("name", properties.path("name").asText());
                nearbyFeature.put("type", properties.path("type").asText());
                nearbyFeature.put("distance", properties.path("distance").asDouble());
                
                // Extract coordinates and handle different geometry types
                JsonNode geometry = feature.path("geometry");
                String geometryType = geometry.path("type").asText();
                JsonNode coordinates = geometry.path("coordinates");
                
                if ("LineString".equals(geometryType)) {
                    // Handle LineString geometry - extract coordinates as proper Java structure
                    List<List<Double>> coordinateList = new ArrayList<>();
                    if (coordinates.isArray()) {
                        for (JsonNode coord : coordinates) {
                            if (coord.isArray() && coord.size() >= 2) {
                                coordinateList.add(List.of(
                                    coord.get(0).asDouble(),
                                    coord.get(1).asDouble()
                                ));
                            }
                        }
                    }
                    nearbyFeature.put("coordinates", coordinateList);
                    nearbyFeature.put("geometry", "LineString");
                    
                    // For compatibility, also set a representative point (first coordinate)
                    if (!coordinateList.isEmpty()) {
                        List<Double> firstCoord = coordinateList.get(0);
                        nearbyFeature.put("longitude", firstCoord.get(0));
                        nearbyFeature.put("latitude", firstCoord.get(1));
                    }
                } else if ("Polygon".equals(geometryType)) {
                    // Handle Polygon geometry - preserve full coordinate array
                    nearbyFeature.put("coordinates", coordinates);
                    nearbyFeature.put("geometry", "Polygon");
                    
                    // For compatibility, calculate centroid as representative point
                    if (coordinates.isArray() && coordinates.size() > 0) {
                        JsonNode exteriorRing = coordinates.get(0);
                        if (exteriorRing.isArray() && exteriorRing.size() > 0) {
                            // Calculate centroid of first ring (exterior ring)
                            double sumLon = 0, sumLat = 0;
                            int pointCount = 0;
                            for (JsonNode coord : exteriorRing) {
                                if (coord.isArray() && coord.size() >= 2) {
                                    sumLon += coord.get(0).asDouble();
                                    sumLat += coord.get(1).asDouble();
                                    pointCount++;
                                }
                            }
                            if (pointCount > 0) {
                                nearbyFeature.put("longitude", sumLon / pointCount);
                                nearbyFeature.put("latitude", sumLat / pointCount);
                            }
                        }
                    }
                } else {
                    // Handle Point geometry (default behavior)
                    if (coordinates.isArray() && coordinates.size() >= 2) {
                        nearbyFeature.put("longitude", coordinates.get(0).asDouble());
                        nearbyFeature.put("latitude", coordinates.get(1).asDouble());
                    }
                    nearbyFeature.put("geometry", "Point");
                }
                nearbyFeatures.add(nearbyFeature);
            }
            
            return nearbyFeatures;
        } catch (Exception e) {
            throw new RuntimeException("Failed to transform nearby features response", e);
        }
    }
    
    /**
     * Transforms the data status response from the GIS API.
     * 
     * @param jsonResponse Raw JSON response from the GIS API
     * @return Transformed data status
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> transformDataStatusResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            return (Map<String, Object>) objectMapper.convertValue(root.path("data"), Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to transform data status response", e);
        }
    }
    
    /**
     * Transforms the data metadata response from the GIS API.
     * 
     * @param jsonResponse Raw JSON response from the GIS API
     * @return Transformed data metadata
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> transformDataMetadataResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            return (Map<String, Object>) objectMapper.convertValue(root.path("data"), Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to transform data metadata response", e);
        }
    }
    
    /**
     * Transforms coordinates from Web Mercator (EPSG:3857) to WGS84 (EPSG:4326).
     * 
     * @param x Web Mercator X coordinate
     * @param y Web Mercator Y coordinate
     * @return Array with [longitude, latitude] in WGS84
     */
    private double[] transformToWGS84(double x, double y) {
        // Web Mercator to WGS84 transformation
        // Web Mercator uses a sphere with radius 6378137 meters
        double longitude = x / 6378137.0 * 180.0 / Math.PI;
        double latitude = Math.atan(Math.sinh(y / 6378137.0)) * 180.0 / Math.PI;
        
        return new double[]{longitude, latitude};
    }
}
