package com.sloview.controller;

import com.sloview.service.GISApiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for the MapDataController.
 * 
 * Tests the map data endpoints to ensure they properly integrate with the GIS API service.
 */
@WebMvcTest(controllers = MapDataController.class)
class MapDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GISApiService gisApiService;

    /**
     * Test that the restaurants endpoint returns data from the GIS API service.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getRestaurants_ShouldReturnRestaurantsFromGISApi() throws Exception {
        // Mock the GIS API service response
        Map<String, Object> mockRestaurant = new HashMap<>();
        mockRestaurant.put("osmId", 12345L);
        mockRestaurant.put("name", "Test Restaurant");
        mockRestaurant.put("amenity", "restaurant");
        mockRestaurant.put("longitude", -120.6596);
        mockRestaurant.put("latitude", 35.2828);
        
        when(gisApiService.getRestaurants(any())).thenReturn(List.of(mockRestaurant));

        mockMvc.perform(get("/api/map/points/amenity/restaurant/wgs84"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].osmId").value(12345))
                .andExpect(jsonPath("$[0].name").value("Test Restaurant"))
                .andExpect(jsonPath("$[0].amenity").value("restaurant"))
                .andExpect(jsonPath("$[0].longitude").value(-120.6596))
                .andExpect(jsonPath("$[0].latitude").value(35.2828));
    }

    /**
     * Test that the restaurants endpoint with limit parameter works correctly.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getRestaurants_WithLimit_ShouldPassLimitToService() throws Exception {
        // Mock the GIS API service response
        when(gisApiService.getRestaurants(5)).thenReturn(List.of());

        mockMvc.perform(get("/api/map/points/amenity/restaurant/wgs84?limit=5"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray());
    }

    /**
     * Test that unsupported amenity types return empty results.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getPointsByAmenityWGS84_UnsupportedAmenity_ShouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/map/points/amenity/shop/wgs84"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}
