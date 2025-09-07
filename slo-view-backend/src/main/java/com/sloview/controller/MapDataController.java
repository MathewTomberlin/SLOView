package com.sloview.controller;

import com.sloview.entity.OSMPoint;
import com.sloview.repository.OSMPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
