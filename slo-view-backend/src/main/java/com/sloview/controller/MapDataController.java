package com.sloview.controller;

import com.sloview.entity.OSMPoint;
import com.sloview.repository.OSMPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "*")
public class MapDataController {
    
    @Autowired
    private OSMPointRepository osmPointRepository;
    
    @GetMapping("/points")
    public ResponseEntity<List<OSMPoint>> getPointsInBounds(
            @RequestParam double minLon,
            @RequestParam double minLat,
            @RequestParam double maxLon,
            @RequestParam double maxLat) {
        
        List<OSMPoint> points = osmPointRepository.findPointsInBounds(
            minLon, minLat, maxLon, maxLat);
        
        return ResponseEntity.ok(points);
    }
    
    @GetMapping("/points/amenity/{amenity}")
    public ResponseEntity<List<OSMPoint>> getPointsByAmenity(@PathVariable String amenity) {
        List<OSMPoint> points = osmPointRepository.findByAmenity(amenity);
        return ResponseEntity.ok(points);
    }
    
    @GetMapping("/points/tourism/{tourism}")
    public ResponseEntity<List<OSMPoint>> getPointsByTourism(@PathVariable String tourism) {
        List<OSMPoint> points = osmPointRepository.findByTourism(tourism);
        return ResponseEntity.ok(points);
    }
    
    @GetMapping("/points/shop/{shop}")
    public ResponseEntity<List<OSMPoint>> getPointsByShop(@PathVariable String shop) {
        List<OSMPoint> points = osmPointRepository.findByShop(shop);
        return ResponseEntity.ok(points);
    }
    
    @GetMapping("/points/search")
    public ResponseEntity<List<OSMPoint>> searchPointsByName(@RequestParam String name) {
        List<OSMPoint> points = osmPointRepository.findByNameContaining(name);
        return ResponseEntity.ok(points);
    }
    
    @GetMapping("/points/amenity/{amenity}/wgs84")
    public ResponseEntity<List<Map<String, Object>>> getPointsByAmenityWGS84(@PathVariable String amenity) {
        List<Object[]> results = osmPointRepository.findByAmenityWithWGS84(amenity);
        List<Map<String, Object>> points = new ArrayList<>();
        
        for (Object[] row : results) {
            Map<String, Object> point = new HashMap<>();
            point.put("osmId", row[0]);
            point.put("name", row[1]);
            point.put("amenity", row[2]);
            point.put("tourism", row[3]);
            point.put("shop", row[4]);
            point.put("highway", row[5]);
            point.put("natural", row[6]);
            point.put("leisure", row[7]);
            point.put("longitude", row[8]);
            point.put("latitude", row[9]);
            points.add(point);
        }
        
        return ResponseEntity.ok(points);
    }
}
