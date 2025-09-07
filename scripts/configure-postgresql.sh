#!/bin/bash
# Configure PostgreSQL for external connections

# Configure PostgreSQL to listen on all addresses
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/15/main/postgresql.conf

# Configure authentication to allow connections from Cloud Run
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/15/main/pg_hba.conf

# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql
sudo systemctl enable postgresql

echo "PostgreSQL configured for external connections"
