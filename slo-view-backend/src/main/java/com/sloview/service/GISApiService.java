package com.sloview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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
     * Fetches data from the API with retry logic for rate limiting.
     * 
     * @param url The URL to fetch
     * @param maxRetries Maximum number of retries
     * @return The response body
     */
    private String fetchWithRetry(String url, int maxRetries) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return webClient.get()
                        .uri(url)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();
            } catch (Exception e) {
                if (e.getMessage().contains("429") && attempt < maxRetries) {
                    // Rate limited, wait longer before retry
                    try {
                        Thread.sleep(1000 * attempt); // Exponential backoff: 1s, 2s, 3s
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Request interrupted", ie);
                    }
                } else {
                    throw e;
                }
            }
        }
        throw new RuntimeException("Failed to fetch data after " + maxRetries + " attempts");
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
