package com.sloview.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for health check endpoints.
 * 
 * Provides a simple health check endpoint to verify that the backend service
 * is running and accessible.
 */
@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    /**
     * Health check endpoint that returns the status of the service.
     * 
     * @return ResponseEntity containing the health status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "slo-view-backend");
        status.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        return ResponseEntity.ok(status);
    }
}
