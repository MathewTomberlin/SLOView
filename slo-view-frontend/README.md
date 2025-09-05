# SLO View Frontend

A React.js frontend application for the SLO View mapping application, featuring an interactive map of San Luis Obispo county with drag and zoom functionality.

## Overview

The SLO View Frontend provides:
- Navigation bar with "SLO View" title
- Interactive map viewer using OpenStreetMap with Leaflet.js
- Drag-to-move and zoom functionality
- Responsive design for different screen sizes
- Local tile caching for improved performance

## Technology Stack

- **Framework**: React.js 19+ with TypeScript
- **Language**: TypeScript with JSX
- **Mapping**: Leaflet.js with OpenStreetMap data
- **Styling**: CSS3 with responsive design
- **Build Tool**: Create React App
- **Package Manager**: npm

## Features

### Navigation Bar
- Fixed position at the top of the page
- Clean, modern design with "SLO View" title
- Responsive design for mobile and desktop

### Map Viewer
- Interactive map centered on San Luis Obispo county
- OpenStreetMap tile layer for detailed mapping
- Drag-to-move functionality
- Zoom in/out with mouse wheel and controls
- Marker for San Luis Obispo city center
- Responsive design that adapts to screen size

## Project Structure

```
slo-view-frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Navbar/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Navbar.css
│   │   │   └── Navbar.test.tsx
│   │   └── MapViewer/
│   │       ├── MapViewer.tsx
│   │       ├── MapViewer.css
│   │       └── MapViewer.test.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── App.test.tsx
│   ├── index.tsx
│   ├── index.css
│   ├── reportWebVitals.ts
│   └── setupTests.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Development Setup

### Prerequisites
- Node.js 14 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slo-view-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Dependencies

### Core Dependencies
- `react`: ^19.1.1 - React library
- `react-dom`: ^19.1.1 - React DOM rendering
- `leaflet`: ^1.9.4 - Interactive map library
- `react-leaflet`: ^5.0.0 - React components for Leaflet

### Development Dependencies
- `typescript`: ^5.9.2 - TypeScript compiler
- `@types/react`: ^19.1.12 - React TypeScript definitions
- `@types/react-dom`: ^19.1.9 - React DOM TypeScript definitions
- `@types/leaflet`: ^1.9.20 - Leaflet TypeScript definitions
- `@types/node`: ^24.3.1 - Node.js TypeScript definitions
- `@types/jest`: ^30.0.0 - Jest TypeScript definitions
- `react-scripts`: 5.0.1 - Create React App scripts
- Various testing and build tools

## Map Configuration

The map is configured with:
- **Center**: San Luis Obispo county (35.2828, -120.6596)
- **Initial Zoom**: Level 10
- **Tile Source**: OpenStreetMap
- **Max Zoom**: Level 19
- **Attribution**: OpenStreetMap contributors

## Styling

The application uses:
- CSS modules for component-specific styles
- Responsive design principles
- Modern CSS features (flexbox, grid)
- Custom Leaflet control styling
- Mobile-first approach

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Optimized bundle size with code splitting
- Efficient map tile loading
- Responsive images and assets
- Minimal external dependencies

## Deployment

### Production Build

```bash
npm run build
```

This creates a `build` folder with optimized static files ready for deployment.

### Google Cloud Storage Deployment

The application is designed to be deployed to Google Cloud Storage for static hosting:

1. Build the application: `npm run build`
2. Upload contents of `build/` directory to Cloud Storage bucket
3. Configure bucket for static website hosting
4. Set `index.html` as the main page

### Environment Variables

No environment variables are required for basic functionality. The application uses OpenStreetMap which doesn't require API keys.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

Tests are located alongside components and use:
- Jest testing framework
- React Testing Library
- Component unit tests
- Integration tests

## Contributing

1. Create a feature branch from `develop`
2. Make your changes with appropriate tests
3. Ensure all tests pass: `npm test`
4. Build successfully: `npm run build`
5. Create a pull request to `develop`

## Code Style

- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Include JSDoc comments for public methods
- Follow conventional commit format

## Troubleshooting

### Common Issues

1. **Map not loading**: Check browser console for errors, ensure internet connection
2. **Styling issues**: Clear browser cache, check CSS import paths
3. **Build failures**: Delete `node_modules` and run `npm install` again

### Development Tips

- Use browser developer tools to debug map interactions
- Check network tab for tile loading issues
- Use React Developer Tools for component debugging

## License

This project is part of the SLO View application suite.