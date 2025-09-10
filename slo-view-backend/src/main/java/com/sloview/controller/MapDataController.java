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
}
