# Project Documentation Rules (Non-Obvious Only)

- Map implementation uses OpenStreetMap with Leaflet.js, not Google Maps or Mapbox as might be assumed
- Project consists of two separate repositories (frontend and backend) with no shared code
- Frontend is deployed to Google Cloud Storage (static hosting), not a traditional web server
- Backend is deployed to Google Cloud Run (containerized), not a traditional server
- Local tile caching is a critical requirement for map performance and offline viewing
- Branching strategy follows GitFlow with specific naming conventions (feature/, release/, hotfix/)
- No authentication is implemented in the MVP (all endpoints are public)
- Health check endpoint is at `/health` path specifically