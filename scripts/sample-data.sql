-- Sample data for SLO View application
-- This creates some test map features for San Luis Obispo County

-- Create the map_features table if it doesn't exist
CREATE TABLE IF NOT EXISTS map_features (
    id SERIAL PRIMARY KEY,
    feature_type VARCHAR(50),
    name VARCHAR(255),
    geometry GEOMETRY,
    properties JSONB
);

-- Insert some sample points of interest in San Luis Obispo
INSERT INTO map_features (feature_type, name, geometry, properties) VALUES
('poi', 'Cal Poly San Luis Obispo', ST_GeomFromText('POINT(-120.6596 35.3050)', 4326), '{"amenity": "university", "website": "https://www.calpoly.edu/"}'),
('poi', 'Mission San Luis Obispo de Tolosa', ST_GeomFromText('POINT(-120.6969 35.2814)', 4326), '{"amenity": "place_of_worship", "historic": "mission"}'),
('poi', 'San Luis Obispo County Regional Airport', ST_GeomFromText('POINT(-120.6414 35.2369)', 4326), '{"aeroway": "aerodrome", "iata": "SBP"}'),
('poi', 'Pismo Beach Pier', ST_GeomFromText('POINT(-120.6250 35.1417)', 4326), '{"leisure": "pier", "tourism": "attraction"}'),
('poi', 'Morro Rock', ST_GeomFromText('POINT(-120.8667 35.3667)', 4326), '{"natural": "rock", "tourism": "attraction"}');

-- Insert some sample roads
INSERT INTO map_features (feature_type, name, geometry, properties) VALUES
('road', 'Highway 101', ST_GeomFromText('LINESTRING(-120.7 35.2, -120.6 35.3, -120.5 35.4)', 4326), '{"highway": "primary", "ref": "US 101"}'),
('road', 'Broad Street', ST_GeomFromText('LINESTRING(-120.7 35.28, -120.65 35.28)', 4326), '{"highway": "secondary", "name": "Broad Street"}');

-- Create spatial index for better performance
CREATE INDEX IF NOT EXISTS idx_map_features_geometry ON map_features USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_map_features_type ON map_features (feature_type);
