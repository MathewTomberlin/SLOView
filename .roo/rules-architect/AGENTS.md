# Project Architecture Rules (Non-Obvious Only)

- Map viewer must use local tile caching (not real-time API calls) for performance and offline viewing
- Frontend must be deployable to Google Cloud Storage static hosting
- Backend must be containerized for Google Cloud Run deployment
- Two separate repositories required (no shared code between frontend and backend)
- Branching strategy: main/develop with feature/release/hotfix naming conventions
- GitHub Actions CI/CD pipeline required for both repositories
- No authentication in MVP (public endpoints only)
- Health check endpoint required at `/health` for backend
- Map implementation must use OpenStreetMap with Leaflet.js (not Google Maps or Mapbox)