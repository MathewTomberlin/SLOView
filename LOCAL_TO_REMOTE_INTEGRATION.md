# Local Project to Remote PostGIS Server Integration

This document explains how the local SLO View project integrates with the remote PostGIS database server.

## Overview

The SLO View application uses a **three-tier architecture** where:
1. **Local Development**: React frontend + Spring Boot backend
2. **Remote Database**: PostGIS server on Google Cloud Compute Engine VM
3. **Production Deployment**: All components deployed to Google Cloud

## Remote PostGIS Server Details

### Server Information
- **Instance Name**: `slo-view-postgis-db`
- **External IP**: `34.83.60.201`
- **Port**: `5432`
- **Database**: `slo_view_db`
- **Username**: `slo_view_user`
- **Password**: `<DB PASSWORD HERE>` (configured in production)

### Database Schema
- **Main Table**: `planet_osm_point`
- **Extensions**: PostGIS, PostGIS Topology
- **Coordinate System**: 3857 (Web Mercator) with 4326 (WGS84) transformations
- **Data Source**: OpenStreetMap data for San Luis Obispo County

## Local Development Configuration

### Backend Configuration (`application.properties`)

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT:5432}/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# HikariCP Configuration
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000

# JPA Configuration
spring.jpa.database-platform=org.hibernate.spatial.dialect.postgis.PostgisPG95Dialect
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.spatial.dialect.postgis.PostgisPG95Dialect
```

### Environment Variables for Local Development

To run the local backend with remote database access:

```bash
# Windows (PowerShell)
$env:DB_HOST="34.83.60.201"
$env:DB_PORT="5432"
$env:DB_NAME="slo_view_db"
$env:DB_USERNAME="slo_view_user"
$env:DB_PASSWORD="<DB PASSWORD HERE>"

# Linux/Mac
export DB_HOST="34.83.60.201"
export DB_PORT="5432"
export DB_NAME="slo_view_db"
export DB_USERNAME="slo_view_user"
export DB_PASSWORD="<DB PASSWORD HERE>"
```

## API Integration Flow

### 1. Frontend to Backend
The React frontend makes HTTP requests to the local backend:

```typescript
// Example from MapViewer.tsx
const fetchRestaurants = async () => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const response = await fetch(`${apiUrl}/api/map/points/amenity/restaurant/wgs84`);
    
    if (response.ok) {
      const data = await response.json();
      setRestaurants(data);
    }
  } catch (error) {
    console.error('Error fetching restaurants:', error);
  }
};
```

### 2. Backend to PostGIS Database
The Spring Boot backend connects to the remote PostGIS server:

```java
// OSMPointRepository.java
@Query(value = "SELECT osm_id, name, amenity, tourism, shop, highway, \"natural\", leisure, " +
               "ST_X(ST_Transform(way, 4326)) as longitude, " +
               "ST_Y(ST_Transform(way, 4326)) as latitude " +
               "FROM planet_osm_point WHERE amenity = :amenity", 
       nativeQuery = true)
List<Object[]> findByAmenityWithWGS84(@Param("amenity") String amenity);
```

## Available API Endpoints

### Spatial Queries
- `GET /api/map/points` - Bounded spatial queries
- `GET /api/map/points/amenity/{amenity}` - Amenity-based queries
- `GET /api/map/points/amenity/{amenity}/wgs84` - WGS84 coordinate queries
- `GET /api/map/points/tourism/{tourism}` - Tourism-based queries
- `GET /api/map/points/shop/{shop}` - Shop-based queries
- `GET /api/map/points/search` - Name-based search

### Example API Calls

```bash
# Get all restaurants with WGS84 coordinates
curl "http://localhost:8080/api/map/points/amenity/restaurant/wgs84"

# Get points within bounding box
curl "http://localhost:8080/api/map/points?minLon=-120.7&minLat=35.1&maxLon=-120.5&maxLat=35.4"

# Search for points by name
curl "http://localhost:8080/api/map/points/search?name=wine"
```

## Database Connection Details

### Connection String
```
jdbc:postgresql://34.83.60.201:5432/slo_view_db
```

### Connection Pool Settings
- **Maximum Pool Size**: 5 connections
- **Minimum Idle**: 1 connection
- **Connection Timeout**: 20 seconds
- **Idle Timeout**: 5 minutes
- **Max Lifetime**: 20 minutes

### Spatial Query Capabilities
- **Bounding Box Queries**: Using `ST_MakeEnvelope` and `ST_Intersects`
- **Coordinate Transformations**: 3857 ↔ 4326 using `ST_Transform`
- **Spatial Indexes**: Optimized for performance
- **PostGIS Functions**: Full PostGIS spatial function support

## Local Development Setup

### 1. Start the Backend
```bash
cd slo-view-backend
mvn spring-boot:run
```

### 2. Start the Frontend
```bash
cd slo-view-frontend
npm start
```

### 3. Test the Integration
1. Open `http://localhost:3000`
2. The map should load with OpenStreetMap tiles
3. Toggle the "Show Restaurants" checkbox
4. Restaurant markers should appear from the remote database

## Production vs Development

### Development Environment
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8080`
- **Database**: Remote PostGIS server (`34.83.60.201:5432`)

### Production Environment
- **Frontend**: `https://storage.googleapis.com/slo-view-frontend/index.html`
- **Backend**: `https://slo-view-backend-ba5fw55ysa-uw.a.run.app`
- **Database**: Same remote PostGIS server

## Troubleshooting

### Common Issues

1. **Database Connection Refused**
   - Check if the PostGIS VM is running
   - Verify firewall rules allow port 5432
   - Confirm database credentials

2. **CORS Errors**
   - Backend has CORS configured for `*` origins
   - Check if backend is running on correct port

3. **Spatial Query Errors**
   - Verify PostGIS extensions are installed
   - Check coordinate system transformations
   - Review SQL query syntax

### Debug Commands

```bash
# Test database connectivity
psql -h 34.83.60.201 -p 5432 -U slo_view_user -d slo_view_db

# Check backend health
curl http://localhost:8080/health

# Test spatial API
curl "http://localhost:8080/api/map/points/amenity/restaurant/wgs84" | head -20
```

## Security Considerations

### Network Security
- Database server is accessible from internet (port 5432)
- No VPN or private network required
- Firewall rules should restrict access if needed

### Credential Management
- Database password is stored in environment variables
- Never commit credentials to version control
- Use GitHub Secrets for CI/CD deployment

### Data Privacy
- OpenStreetMap data is public domain
- No sensitive user data stored
- All queries are read-only

## Performance Optimization

### Database Optimization
- Spatial indexes on geometry columns
- Connection pooling with HikariCP
- Efficient coordinate transformations

### API Optimization
- Pagination for large result sets
- Caching for frequently accessed data
- Compression for large responses

### Frontend Optimization
- Debounced API calls during map interactions
- Efficient marker rendering
- Local state management

This integration allows the local development environment to work seamlessly with the remote PostGIS database, providing real-time spatial data for the SLO View application.
