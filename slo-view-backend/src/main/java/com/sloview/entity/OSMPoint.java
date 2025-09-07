package com.sloview.entity;

import javax.persistence.*;
import org.locationtech.jts.geom.Point;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "planet_osm_point")
public class OSMPoint {
    @Id
    @Column(name = "osm_id")
    private Long osmId;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "amenity")
    private String amenity;
    
    @Column(name = "tourism")
    private String tourism;
    
    @Column(name = "shop")
    private String shop;
    
    @Column(name = "highway")
    private String highway;
    
    @Column(name = "natural")
    private String natural;
    
    @Column(name = "leisure")
    private String leisure;
    
    @Column(name = "way", columnDefinition = "geometry(Point,3857)")
    @JsonIgnore
    private Point way;
    
    // Constructors
    public OSMPoint() {}
    
    // Getters and Setters
    public Long getOsmId() {
        return osmId;
    }
    
    public void setOsmId(Long osmId) {
        this.osmId = osmId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getAmenity() {
        return amenity;
    }
    
    public void setAmenity(String amenity) {
        this.amenity = amenity;
    }
    
    public String getTourism() {
        return tourism;
    }
    
    public void setTourism(String tourism) {
        this.tourism = tourism;
    }
    
    public String getShop() {
        return shop;
    }
    
    public void setShop(String shop) {
        this.shop = shop;
    }
    
    public String getHighway() {
        return highway;
    }
    
    public void setHighway(String highway) {
        this.highway = highway;
    }
    
    public String getNatural() {
        return natural;
    }
    
    public void setNatural(String natural) {
        this.natural = natural;
    }
    
    public String getLeisure() {
        return leisure;
    }
    
    public void setLeisure(String leisure) {
        this.leisure = leisure;
    }
    
    public Point getWay() {
        return way;
    }
    
    public void setWay(Point way) {
        this.way = way;
    }
    
    // Custom getters for JSON serialization
    public Double getLongitude() {
        return way != null ? way.getX() : null;
    }
    
    public Double getLatitude() {
        return way != null ? way.getY() : null;
    }
    
}
