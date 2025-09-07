-- Setup database user and permissions
CREATE USER slo_view_user WITH PASSWORD 'app_password_here';
GRANT ALL PRIVILEGES ON DATABASE slo_view_db TO slo_view_user;
GRANT ALL ON SCHEMA public TO slo_view_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO slo_view_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO slo_view_user;
