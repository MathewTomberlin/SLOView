package com.sloview.controller;

import com.sloview.service.GISApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "*")
public class MapDataController {
    
    @Autowired
    private GISApiService gisApiService;
    
    /**
     * Get restaurants from the GIS API.
     * This is the main endpoint used by the frontend.
     */
    @GetMapping("/points/amenity/restaurant/wgs84")
    public ResponseEntity<List<Map<String, Object>>> getRestaurants(
            @RequestParam(required = false) Integer limit) {
        List<Map<String, Object>> restaurants = gisApiService.getRestaurants(limit);
        return ResponseEntity.ok(restaurants);
    }
    
    /**
     * Placeholder for other amenity types - currently only restaurants are supported.
     */
    @GetMapping("/points/amenity/{amenity}/wgs84")
    public ResponseEntity<List<Map<String, Object>>> getPointsByAmenityWGS84(@PathVariable String amenity) {
        if ("restaurant".equals(amenity)) {
            return getRestaurants(null);
        } else {
            // Return empty list for unsupported amenity types
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Placeholder for other query types - currently not implemented.
     */
    @GetMapping("/points")
    public ResponseEntity<List<Map<String, Object>>> getPointsInBounds(
            @RequestParam double minLon,
            @RequestParam double minLat,
            @RequestParam double maxLon,
            @RequestParam double maxLat) {
        // TODO: Implement spatial queries when the GIS API supports them
        return ResponseEntity.ok(List.of());
    }
    
    @GetMapping("/points/tourism/{tourism}")
    public ResponseEntity<List<Map<String, Object>>> getPointsByTourism(@PathVariable String tourism) {
        // TODO: Implement when tourism endpoint is available
        return ResponseEntity.ok(List.of());
    }
    
    @GetMapping("/points/shop/{shop}")
    public ResponseEntity<List<Map<String, Object>>> getPointsByShop(@PathVariable String shop) {
        // TODO: Implement when shop endpoint is available
        return ResponseEntity.ok(List.of());
    }
    
    @GetMapping("/points/search")
    public ResponseEntity<List<Map<String, Object>>> searchPointsByName(@RequestParam String name) {
        // TODO: Implement when search endpoint is available
        return ResponseEntity.ok(List.of());
    }
    
    /**
     * Get restaurants near a specific location.
     */
    @GetMapping("/restaurants")
    public ResponseEntity<List<Map<String, Object>>> getRestaurants(
            @RequestParam double lon,
            @RequestParam double lat,
            @RequestParam(required = false, defaultValue = "5000") double distance,
            @RequestParam(required = false, defaultValue = "1000") Integer limit) {
        List<Map<String, Object>> restaurants = gisApiService.findNearbyFeatures(lon, lat, distance, "mv_restaurants", limit);
        return ResponseEntity.ok(restaurants);
    }
    
    /**
     * Get roads near a specific location.
     */
    @GetMapping("/roads")
    public ResponseEntity<List<Map<String, Object>>> getRoads(
            @RequestParam double lon,
            @RequestParam double lat,
            @RequestParam(required = false, defaultValue = "5000") double distance,
            @RequestParam(required = false, defaultValue = "1000") Integer limit) {
        List<Map<String, Object>> roads = gisApiService.findNearbyFeatures(lon, lat, distance, "mv_road_network", limit);
        return ResponseEntity.ok(roads);
    }
    
    /**
     * Get points of interest near a specific location.
     */
    @GetMapping("/pois")
    public ResponseEntity<List<Map<String, Object>>> getPOIs(
            @RequestParam double lon,
            @RequestParam double lat,
            @RequestParam(required = false, defaultValue = "5000") double distance,
            @RequestParam(required = false, defaultValue = "1000") Integer limit) {
        List<Map<String, Object>> pois = gisApiService.findNearbyFeatures(lon, lat, distance, "planet_osm_point", limit);
        return ResponseEntity.ok(pois);
    }
    
    
    /**
     * Get spatial summary statistics from the GIS API.
     */
    @GetMapping("/spatial/summary")
    public ResponseEntity<Map<String, Object>> getSpatialSummary() {
        Map<String, Object> summary = gisApiService.getSpatialSummary();
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Find nearby features using optimized spatial search.
     */
    @GetMapping("/spatial/nearby")
    public ResponseEntity<List<Map<String, Object>>> findNearbyFeatures(
            @RequestParam double lon,
            @RequestParam double lat,
            @RequestParam(required = false, defaultValue = "1000") double distance,
            @RequestParam(required = false, defaultValue = "mv_restaurants") String table,
            @RequestParam(required = false, defaultValue = "1000") Integer limit) {
        List<Map<String, Object>> features = gisApiService.findNearbyFeatures(lon, lat, distance, table, limit);
        return ResponseEntity.ok(features);
    }
    
    /**
     * Get data status and health information from the GIS API.
     */
    @GetMapping("/data/status")
    public ResponseEntity<Map<String, Object>> getDataStatus() {
        Map<String, Object> status = gisApiService.getDataStatus();
        return ResponseEntity.ok(status);
    }
    
    /**
     * Get data metadata and schema information from the GIS API.
     */
    @GetMapping("/data/metadata")
    public ResponseEntity<Map<String, Object>> getDataMetadata() {
        Map<String, Object> metadata = gisApiService.getDataMetadata();
        return ResponseEntity.ok(metadata);
    }
}
