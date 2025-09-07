#!/bin/bash
# postgis-setup.sh

echo "Starting PostgreSQL and PostGIS installation..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PostGIS
sudo apt install -y postgis postgresql-14-postgis-3

# Install additional tools
sudo apt install -y osm2pgsql curl wget

# Configure PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'secure_password_here';"
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
sudo -u postgres psql -c "CREATE USER slo_view_user WITH PASSWORD 'app_password_here';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE slo_view_db TO slo_view_user;"
sudo -u postgres psql -d slo_view_db -c "GRANT ALL ON SCHEMA public TO slo_view_user;"

echo "PostgreSQL and PostGIS installation completed!"
echo "Database: slo_view_db"
echo "User: slo_view_user"
echo "Password: app_password_here"
