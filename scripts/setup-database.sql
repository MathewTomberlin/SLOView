-- Setup database user and permissions
-- NOTE: Replace 'YOUR_SECURE_PASSWORD' with a secure password
CREATE USER slo_view_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE slo_view_db TO slo_view_user;
GRANT ALL ON SCHEMA public TO slo_view_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO slo_view_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO slo_view_user;
