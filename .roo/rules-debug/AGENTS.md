# Project Debug Rules (Non-Obvious Only)

- Map tile caching issues may cause silent failures in offline viewing
- Frontend deployment issues specifically relate to Google Cloud Storage configuration
- Backend deployment issues specifically relate to containerization for Google Cloud Run
- Map drag and zoom functionality requires manual UI testing (cannot be fully automated)
- Cross-browser compatibility issues may occur with Leaflet.js implementation
- Local storage limitations may affect map tile caching performance
- Network connectivity issues may not be immediately apparent with local tile caching