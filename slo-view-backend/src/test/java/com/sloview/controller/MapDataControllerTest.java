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
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
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

    /**
     * Test that the roads endpoint returns data from the GIS API service.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getRoads_ShouldReturnRoadsFromGISApi() throws Exception {
        // Mock the GIS API service response
        Map<String, Object> mockRoad = new HashMap<>();
        mockRoad.put("osmId", 67890L);
        mockRoad.put("name", "Test Road");
        mockRoad.put("type", "primary");
        mockRoad.put("longitude", -120.6596);
        mockRoad.put("latitude", 35.2828);
        mockRoad.put("geometry", "LineString");
        
        when(gisApiService.getRoads(any())).thenReturn(List.of(mockRoad));

        mockMvc.perform(get("/api/map/roads"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].osmId").value(67890))
                .andExpect(jsonPath("$[0].name").value("Test Road"))
                .andExpect(jsonPath("$[0].type").value("primary"))
                .andExpect(jsonPath("$[0].longitude").value(-120.6596))
                .andExpect(jsonPath("$[0].latitude").value(35.2828))
                .andExpect(jsonPath("$[0].geometry").value("LineString"));
    }

    /**
     * Test that the roads endpoint with limit parameter works correctly.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getRoads_WithLimit_ShouldPassLimitToService() throws Exception {
        // Mock the GIS API service response
        when(gisApiService.getRoads(10)).thenReturn(List.of());

        mockMvc.perform(get("/api/map/roads?limit=10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray());
    }

    /**
     * Test that the POIs endpoint returns data from the GIS API service.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getPOIs_ShouldReturnPOIsFromGISApi() throws Exception {
        // Mock the GIS API service response
        Map<String, Object> mockPOI = new HashMap<>();
        mockPOI.put("osmId", 11111L);
        mockPOI.put("name", "Test POI");
        mockPOI.put("type", "atm");
        mockPOI.put("longitude", -120.6596);
        mockPOI.put("latitude", 35.2828);
        mockPOI.put("geometry", "Point");
        
        when(gisApiService.getPOIs(any())).thenReturn(List.of(mockPOI));

        mockMvc.perform(get("/api/map/pois"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].osmId").value(11111))
                .andExpect(jsonPath("$[0].name").value("Test POI"))
                .andExpect(jsonPath("$[0].type").value("atm"))
                .andExpect(jsonPath("$[0].longitude").value(-120.6596))
                .andExpect(jsonPath("$[0].latitude").value(35.2828))
                .andExpect(jsonPath("$[0].geometry").value("Point"));
    }

    /**
     * Test that the POIs endpoint with limit parameter works correctly.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getPOIs_WithLimit_ShouldPassLimitToService() throws Exception {
        // Mock the GIS API service response
        when(gisApiService.getPOIs(15)).thenReturn(List.of());

        mockMvc.perform(get("/api/map/pois?limit=15"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray());
    }

    /**
     * Test that the spatial summary endpoint returns data from the GIS API service.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getSpatialSummary_ShouldReturnSummaryFromGISApi() throws Exception {
        // Mock the GIS API service response
        Map<String, Object> mockSummary = new HashMap<>();
        mockSummary.put("restaurants", 710);
        mockSummary.put("roads", 54534);
        mockSummary.put("pois", 3629);
        
        when(gisApiService.getSpatialSummary()).thenReturn(mockSummary);

        mockMvc.perform(get("/api/map/spatial/summary"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.restaurants").value(710))
                .andExpect(jsonPath("$.roads").value(54534))
                .andExpect(jsonPath("$.pois").value(3629));
    }

    /**
     * Test that the nearby features endpoint returns data from the GIS API service.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void findNearbyFeatures_ShouldReturnFeaturesFromGISApi() throws Exception {
        // Mock the GIS API service response
        Map<String, Object> mockFeature = new HashMap<>();
        mockFeature.put("osmId", 12345L);
        mockFeature.put("name", "Test Restaurant");
        mockFeature.put("type", "restaurant");
        mockFeature.put("latitude", 35.2828);
        mockFeature.put("longitude", -120.6596);
        mockFeature.put("distance", 0.0);
        mockFeature.put("geometry", "Point");
        
        when(gisApiService.findNearbyFeatures(anyDouble(), anyDouble(), anyDouble(), anyString(), anyInt()))
                .thenReturn(List.of(mockFeature));

        mockMvc.perform(get("/api/map/spatial/nearby?lon=-120.6596&lat=35.2828&distance=1000&table=mv_restaurants&limit=1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].osmId").value(12345))
                .andExpect(jsonPath("$[0].name").value("Test Restaurant"))
                .andExpect(jsonPath("$[0].type").value("restaurant"))
                .andExpect(jsonPath("$[0].latitude").value(35.2828))
                .andExpect(jsonPath("$[0].longitude").value(-120.6596))
                .andExpect(jsonPath("$[0].distance").value(0.0))
                .andExpect(jsonPath("$[0].geometry").value("Point"));
    }

    /**
     * Test that the data status endpoint returns data from the GIS API service.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getDataStatus_ShouldReturnStatusFromGISApi() throws Exception {
        // Mock the GIS API service response
        Map<String, Object> mockStatus = new HashMap<>();
        mockStatus.put("database", Map.of("status", "healthy", "database_size", "591 MB"));
        mockStatus.put("record_counts", Map.of("restaurants", 710, "roads", 54534, "pois", 3629));
        mockStatus.put("health", "healthy");
        
        when(gisApiService.getDataStatus()).thenReturn(mockStatus);

        mockMvc.perform(get("/api/map/data/status"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.health").value("healthy"))
                .andExpect(jsonPath("$.database.status").value("healthy"))
                .andExpect(jsonPath("$.record_counts.restaurants").value(710));
    }

    /**
     * Test that the data metadata endpoint returns data from the GIS API service.
     * 
     * @throws Exception if the test fails
     */
    @Test
    void getDataMetadata_ShouldReturnMetadataFromGISApi() throws Exception {
        // Mock the GIS API service response
        Map<String, Object> mockMetadata = new HashMap<>();
        mockMetadata.put("layers", List.of(
            Map.of("name", "restaurants", "description", "Restaurant locations", "geometry_type", "point"),
            Map.of("name", "roads", "description", "Road network", "geometry_type", "linestring")
        ));
        mockMetadata.put("coordinate_systems", List.of("EPSG:3857", "EPSG:4326"));
        
        when(gisApiService.getDataMetadata()).thenReturn(mockMetadata);

        mockMvc.perform(get("/api/map/data/metadata"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.layers").isArray())
                .andExpect(jsonPath("$.layers[0].name").value("restaurants"))
                .andExpect(jsonPath("$.coordinate_systems").isArray())
                .andExpect(jsonPath("$.coordinate_systems[0]").value("EPSG:3857"));
    }
}
