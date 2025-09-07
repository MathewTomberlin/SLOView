package com.sloview.repository;

import com.sloview.entity.OSMPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OSMPointRepository extends JpaRepository<OSMPoint, Long> {
    
    @Query(value = "SELECT * FROM planet_osm_point WHERE way && ST_Transform(ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326), 3857)", 
           nativeQuery = true)
    List<OSMPoint> findPointsInBounds(@Param("minLon") double minLon, 
                                      @Param("minLat") double minLat,
                                      @Param("maxLon") double maxLon, 
                                      @Param("maxLat") double maxLat);
    
    List<OSMPoint> findByAmenity(String amenity);
    
    List<OSMPoint> findByTourism(String tourism);
    
    List<OSMPoint> findByShop(String shop);
    
    List<OSMPoint> findByNameContaining(String name);
    
    @Query(value = "SELECT osm_id, name, amenity, tourism, shop, highway, \"natural\", leisure, " +
                   "ST_X(ST_Transform(way, 4326)) as longitude, " +
                   "ST_Y(ST_Transform(way, 4326)) as latitude " +
                   "FROM planet_osm_point WHERE amenity = :amenity", 
           nativeQuery = true)
    List<Object[]> findByAmenityWithWGS84(@Param("amenity") String amenity);
}
