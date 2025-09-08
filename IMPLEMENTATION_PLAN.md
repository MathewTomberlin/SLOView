# SLO View - PostGIS Database Integration Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for integrating a PostGIS database server into the existing SLO View application. The solution will add a PostgreSQL database with PostGIS extensions running on a Google Cloud Compute Engine VM, designed to stay within the free tier for low-traffic scenarios while providing geospatial capabilities for San Luis Obispo County map data.

## Current Architecture Analysis

### Existing Infrastructure
- **Frontend**: React TypeScript app hosted in Google Cloud Storage
- **Backend**: Spring Boot API hosted in Google Cloud Run
- **CI/CD**: GitHub Actions with automated deployment
- **Project**: `slo-view-app` in Google Cloud Platform
- **Region**: `us-west1` (Oregon)
- **Current Backend**: Basic health check endpoint only

### Technology Stack
- **Frontend**: React 19.1.1, TypeScript 5.9.2, Leaflet.js 1.9.4
- **Backend**: Spring Boot 2.7.18, Java 11, Maven
- **Deployment**: Docker containers, Google Cloud Run
- **Mapping**: OpenStreetMap with local tile caching

## Implementation Strategy

### Option 1: Compute Engine VM (Recommended for Free Tier)
**Pros:**
- Stays within Google Cloud free tier limits
- Full control over PostgreSQL/PostGIS configuration
- Cost-effective for low-traffic scenarios
- Direct access for data loading and maintenance

**Cons:**
- Requires manual setup and maintenance
- No automatic backups (manual setup required)
- Single point of failure

### Option 2: Cloud SQL for PostgreSQL
**Pros:**
- Managed service with automatic backups
- High availability options
- Built-in monitoring and maintenance

**Cons:**
- Exceeds free tier limits (starts at ~$25/month)
- Less control over configuration
- Higher cost for low-traffic scenarios

**Recommendation**: Proceed with Option 1 (Compute Engine VM) to maintain free tier compliance.

## Detailed Implementation Plan

### Phase 1: Infrastructure Setup

#### 1.1 Create Compute Engine VM Instance

**VM Configuration:**
```bash
# VM Instance Details
Name: slo-view-postgis-db
Machine Type: e2-micro (1 vCPU, 1 GB RAM)
Region: us-west1-a (Oregon)
Zone: us-west1-a
Boot Disk: Debian 12 (30 GB standard persistent disk)
Firewall: Allow HTTP, HTTPS, and custom port 5432
```

**GCP Commands:**
```bash
# Create VM instance
gcloud compute instances create slo-view-postgis-db \
    --zone=us-west1-a \
    --machine-type=e2-micro \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account=slo-view-cicd@slo-view-app.iam.gserviceaccount.com \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --create-disk=auto-delete=yes,boot=yes,device-name=slo-view-postgis-db,image=projects/debian-cloud/global/images/debian-12-bookworm-v20241210,mode=rw,size=30,type=projects/slo-view-app/zones/us-west1-a/diskTypes/pd-standard \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --labels=purpose=postgis-database,environment=production \
    --reservation-affinity=any
```

#### 1.2 Configure Firewall Rules

```bash
# Allow PostgreSQL connections from Cloud Run
gcloud compute firewall-rules create allow-postgresql-from-cloud-run \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:5432 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=postgresql-server
```

#### 1.3 Install PostgreSQL and PostGIS

**VM Setup Script:**
```bash
#!/bin/bash
# postgis-setup.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PostGIS
sudo apt install -y postgis postgresql-14-postgis-3

# Install additional tools
sudo apt install -y osm2pgsql curl wget

# Configure PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'YOUR_POSTGRES_PASSWORD';"
sudo -u postgres createdb slo_view_db

# Enable PostGIS extension
sudo -u postgres psql -d slo_view_db -c "CREATE EXTENSION postgis;"
sudo -u postgres psql -d slo_view_db -c "CREATE EXTENSION postgis_topology;"

# Configure PostgreSQL for external connections
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/14/main/postgresql.conf

# Configure authentication
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql

# Create application user
sudo -u postgres psql -c "CREATE USER slo_view_user WITH PASSWORD 'YOUR_APP_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE slo_view_db TO slo_view_user;"
sudo -u postgres psql -d slo_view_db -c "GRANT ALL ON SCHEMA public TO slo_view_user;"
```

### Phase 2: Backend Integration

#### 2.1 Update Spring Boot Dependencies

**Add to `slo-view-backend/pom.xml`:**
```xml
<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- HikariCP Connection Pool -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
</dependency>

<!-- Spring Boot Configuration Processor -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

#### 2.2 Database Configuration

**Update `slo-view-backend/src/main/resources/application.properties`:**
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:slo_view_db}
spring.datasource.username=${DB_USERNAME:slo_view_user}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# HikariCP Configuration
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# Environment-specific overrides
spring.profiles.active=${SPRING_PROFILES_ACTIVE:default}
```

**Production Configuration (`application-prod.properties`):**
```properties
# Production database settings
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# Disable SQL logging in production
spring.jpa.show-sql=false
logging.level.org.hibernate.SQL=WARN
```

#### 2.3 Create Database Entities and Repositories

**Create JPA Entity for Map Features:**
```java
// src/main/java/com/sloview/entity/MapFeature.java
package com.sloview.entity;

import javax.persistence.*;
import org.locationtech.jts.geom.Geometry;

@Entity
@Table(name = "map_features")
public class MapFeature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "feature_type")
    private String featureType;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "geometry", columnDefinition = "geometry")
    private Geometry geometry;
    
    @Column(name = "properties", columnDefinition = "jsonb")
    private String properties;
    
    // Constructors, getters, setters
}
```

**Create Repository Interface:**
```java
// src/main/java/com/sloview/repository/MapFeatureRepository.java
package com.sloview.repository;

import com.sloview.entity.MapFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MapFeatureRepository extends JpaRepository<MapFeature, Long> {
    
    @Query(value = "SELECT * FROM map_features WHERE ST_Intersects(geometry, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))", 
           nativeQuery = true)
    List<MapFeature> findFeaturesInBounds(@Param("minLon") double minLon, 
                                         @Param("minLat") double minLat,
                                         @Param("maxLon") double maxLon, 
                                         @Param("maxLat") double maxLat);
    
    List<MapFeature> findByFeatureType(String featureType);
}
```

#### 2.4 Create API Controllers

**Create Map Data Controller:**
```java
// src/main/java/com/sloview/controller/MapDataController.java
package com.sloview.controller;

import com.sloview.entity.MapFeature;
import com.sloview.repository.MapFeatureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "*")
public class MapDataController {
    
    @Autowired
    private MapFeatureRepository mapFeatureRepository;
    
    @GetMapping("/features")
    public ResponseEntity<List<MapFeature>> getFeaturesInBounds(
            @RequestParam double minLon,
            @RequestParam double minLat,
            @RequestParam double maxLon,
            @RequestParam double maxLat) {
        
        List<MapFeature> features = mapFeatureRepository.findFeaturesInBounds(
            minLon, minLat, maxLon, maxLat);
        
        return ResponseEntity.ok(features);
    }
    
    @GetMapping("/features/{type}")
    public ResponseEntity<List<MapFeature>> getFeaturesByType(@PathVariable String type) {
        List<MapFeature> features = mapFeatureRepository.findByFeatureType(type);
        return ResponseEntity.ok(features);
    }
}
```

### Phase 3: OSM Data Loading

#### 3.1 Download San Luis Obispo County OSM Data

```bash
# Download OSM data for San Luis Obispo County
wget https://download.geofabrik.de/north-america/us/california/san-luis-obispo-latest.osm.pbf

# Alternative: Download entire California and extract SLO County
wget https://download.geofabrik.de/north-america/us/california-latest.osm.pbf
```

#### 3.2 Import OSM Data into PostGIS

**Data Import Script:**
```bash
#!/bin/bash
# import-osm-data.sh

# Set variables
DB_NAME="slo_view_db"
DB_USER="slo_view_user"
OSM_FILE="san-luis-obispo-latest.osm.pbf"

# Import OSM data using osm2pgsql
osm2pgsql -d $DB_NAME \
    -U $DB_USER \
    -H localhost \
    -P 5432 \
    --create \
    --slim \
    --drop \
    --cache 100 \
    --number-processes 1 \
    --style /usr/share/osm2pgsql/default.style \
    $OSM_FILE

# Create spatial indexes for better performance
psql -d $DB_NAME -U $DB_USER -c "
CREATE INDEX IF NOT EXISTS idx_planet_osm_point_geom ON planet_osm_point USING GIST (way);
CREATE INDEX IF NOT EXISTS idx_planet_osm_line_geom ON planet_osm_line USING GIST (way);
CREATE INDEX IF NOT EXISTS idx_planet_osm_polygon_geom ON planet_osm_polygon USING GIST (way);
"

# Create custom views for common queries
psql -d $DB_NAME -U $DB_USER -c "
CREATE OR REPLACE VIEW slo_roads AS
SELECT osm_id, name, highway, way
FROM planet_osm_line 
WHERE highway IS NOT NULL;

CREATE OR REPLACE VIEW slo_pois AS
SELECT osm_id, name, amenity, tourism, way
FROM planet_osm_point 
WHERE amenity IS NOT NULL OR tourism IS NOT NULL;
"
```

### Phase 4: Deployment Configuration

#### 4.1 Update Docker Configuration

**Update `slo-view-backend/Dockerfile`:**
```dockerfile
# Multi-stage build for optimized container size
FROM maven:3.8.6-openjdk-11-slim AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build application
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:11-jre-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN addgroup --system spring && adduser --system spring --ingroup spring

# Set working directory
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership to spring user
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring:spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 4.2 Update CI/CD Pipeline

**Update `.github/workflows/ci.yml` to include database environment variables:**
```yaml
# Add to deploy-production job
- name: Deploy backend to production
  run: |
    cd slo-view-backend
    docker build -t gcr.io/${{ env.PROJECT_ID }}/${{ env.BACKEND_SERVICE_NAME }} .
    docker push gcr.io/${{ env.PROJECT_ID }}/${{ env.BACKEND_SERVICE_NAME }}
    gcloud run deploy ${{ env.BACKEND_SERVICE_NAME }} \
      --image gcr.io/${{ env.PROJECT_ID }}/${{ env.BACKEND_SERVICE_NAME }} \
      --platform managed \
      --region ${{ env.REGION }} \
      --allow-unauthenticated \
      --port 8080 \
      --memory 512Mi \
      --cpu 1 \
      --max-instances 10 \
      --set-env-vars ENVIRONMENT=production,DB_HOST=${{ secrets.DB_HOST }},DB_USERNAME=${{ secrets.DB_USERNAME }},DB_PASSWORD=${{ secrets.DB_PASSWORD }},DB_NAME=${{ secrets.DB_NAME }}
```

#### 4.3 Add GitHub Secrets

**Required GitHub Repository Secrets:**
- `DB_HOST`: External IP of the PostGIS VM
- `DB_USERNAME`: Database username (slo_view_user)
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name (slo_view_db)

### Phase 5: Frontend Integration

#### 5.1 Update MapViewer Component

**Enhance `slo-view-frontend/src/components/MapViewer/MapViewer.tsx`:**
```typescript
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapViewer.css';

interface MapFeature {
  id: number;
  featureType: string;
  name: string;
  geometry: any;
  properties: any;
}

const MapViewer: React.FC = () => {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [map, setMap] = useState<L.Map | null>(null);

  const fetchMapFeatures = async (bounds: L.LatLngBounds) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/map/features?` +
        `minLon=${bounds.getWest()}&minLat=${bounds.getSouth()}&` +
        `maxLon=${bounds.getEast()}&maxLat=${bounds.getNorth()}`
      );
      const data = await response.json();
      setFeatures(data);
    } catch (error) {
      console.error('Error fetching map features:', error);
    }
  };

  useEffect(() => {
    if (map) {
      map.on('moveend', () => {
        fetchMapFeatures(map.getBounds());
      });
      
      // Initial load
      fetchMapFeatures(map.getBounds());
    }
  }, [map]);

  return (
    <div className="map-viewer">
      <MapContainer
        center={[35.2828, -120.6596]} // San Luis Obispo coordinates
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {features.map((feature) => (
          <GeoJSON
            key={feature.id}
            data={feature.geometry}
            style={{
              color: feature.featureType === 'road' ? '#3388ff' : '#ff7800',
              weight: 2,
              opacity: 0.8
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapViewer;
```

### Phase 6: Monitoring and Maintenance

#### 6.1 Database Monitoring

**Create monitoring script:**
```bash
#!/bin/bash
# monitor-db.sh

# Check database connectivity
psql -h localhost -U slo_view_user -d slo_view_db -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Database connection: OK"
else
    echo "Database connection: FAILED"
fi

# Check disk usage
df -h | grep "/dev/sda1"

# Check memory usage
free -h

# Check PostgreSQL status
systemctl status postgresql --no-pager
```

#### 6.2 Backup Strategy

**Create backup script:**
```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/home/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="slo_view_db_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U slo_view_user -d slo_view_db > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

**Set up automated backups:**
```bash
# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /home/backup-db.sh
```

## Cost Analysis

### Google Cloud Free Tier (2025)
- **Compute Engine**: 1 e2-micro instance per month (744 hours)
- **Persistent Disk**: 30 GB standard persistent disk
- **Network Egress**: 1 GB per month
- **Total Estimated Cost**: $0/month (within free tier)

### Resource Usage Estimates
- **CPU**: 5-15% average usage for low traffic
- **Memory**: 200-400 MB average usage
- **Storage**: 5-10 GB for OSM data + PostgreSQL
- **Network**: Minimal for local queries

## Security Considerations

### Network Security
- Firewall rules restrict access to PostgreSQL port (5432)
- Database user has limited privileges
- SSL/TLS encryption for database connections (future enhancement)

### Data Security
- Regular automated backups
- Database user passwords stored as environment variables
- No sensitive data in version control

## Testing Strategy

### Unit Tests
- Repository layer tests with H2 in-memory database
- Controller tests with MockMvc
- Service layer tests with mocked dependencies

### Integration Tests
- Database connectivity tests
- API endpoint tests with real PostGIS queries
- End-to-end tests with test OSM data

### Performance Tests
- Query performance benchmarks
- Concurrent user simulation
- Memory usage monitoring

## Rollback Plan

### Database Rollback
1. Restore from latest backup
2. Revert application deployment
3. Update environment variables

### Application Rollback
1. Revert to previous Docker image
2. Update Cloud Run service
3. Verify health checks

## Future Enhancements

### Phase 2 Features
- Spatial indexing optimization
- Caching layer with Redis
- Advanced geospatial queries
- Real-time data updates

### Phase 3 Features
- High availability setup
- Read replicas for scaling
- Advanced monitoring and alerting
- Custom map styling

## Implementation Timeline

### Week 1: Infrastructure Setup
- Day 1-2: Create VM and install PostgreSQL/PostGIS
- Day 3-4: Configure networking and security
- Day 5: Test database connectivity

### Week 2: Backend Integration
- Day 1-2: Update Spring Boot dependencies and configuration
- Day 3-4: Create entities, repositories, and controllers
- Day 5: Test API endpoints

### Week 3: Data Loading and Testing
- Day 1-2: Download and import OSM data
- Day 3-4: Create indexes and optimize queries
- Day 5: Performance testing and optimization

### Week 4: Deployment and Integration
- Day 1-2: Update CI/CD pipeline and deploy
- Day 3-4: Frontend integration and testing
- Day 5: End-to-end testing and documentation

## Success Criteria

### Functional Requirements
- [ ] PostGIS database running on Compute Engine VM
- [ ] Spring Boot backend connected to PostGIS
- [ ] OSM data for San Luis Obispo County loaded
- [ ] API endpoints returning geospatial data
- [ ] Frontend displaying map features from database

### Performance Requirements
- [ ] API response times < 500ms for typical queries
- [ ] Database queries optimized with spatial indexes
- [ ] System stays within free tier resource limits
- [ ] 99% uptime for database service

### Security Requirements
- [ ] Database access restricted to application only
- [ ] No sensitive data in version control
- [ ] Regular automated backups
- [ ] Monitoring and alerting configured

## Conclusion

This implementation plan provides a comprehensive roadmap for integrating PostGIS database capabilities into the SLO View application while maintaining cost-effectiveness through Google Cloud's free tier. The solution is designed to be scalable, maintainable, and secure, providing a solid foundation for future geospatial features.

The phased approach ensures minimal disruption to the existing application while gradually adding database capabilities. The focus on San Luis Obispo County data keeps the system manageable while providing real value for local users.

By following this plan, the SLO View application will evolve from a simple map viewer to a full-featured geospatial application with database-backed map data, setting the stage for advanced features like search, routing, and real-time updates.
