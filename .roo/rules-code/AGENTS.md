# Project Coding Rules (Non-Obvious Only)

- Map viewer implementation must use Leaflet.js with OpenStreetMap data, not Google Maps or Mapbox
- Local tile caching is required for map performance and offline viewing
- Component files must follow the pattern: ComponentName.js with ComponentName.css
- All API endpoints must be public (no authentication) for MVP
- Backend health check endpoint must be at `/health` path
- Frontend must be deployable to Google Cloud Storage static hosting
- Backend must be containerized for Google Cloud Run deployment
- Tests for map functionality require manual UI testing for drag and zoom features