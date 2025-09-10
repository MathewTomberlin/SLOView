package com.sloview;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for SLO View Backend API.
 * 
 * This Spring Boot application provides a minimal API backend for the SLO View
 * frontend application, including a health check endpoint and GIS API integration.
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class SLOViewApplication {

    /**
     * Main method to start the Spring Boot application.
     * 
     * @param args command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(SLOViewApplication.class, args);
    }
}
