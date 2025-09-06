# SLO View - Complete Implementation

A web-based mapping application that displays an interactive map of San Luis Obispo county with drag and zoom functionality. The application consists of a React TypeScript frontend and Spring Boot backend, both deployed to Google Cloud Platform.

## 🎯 Project Overview

The SLO View application features:
- **React TypeScript Frontend** - Hosted in Google Cloud Storage
- **Spring Boot Backend** - Hosted in Google Cloud Run
- **Interactive Map** - OpenStreetMap with Leaflet.js for San Luis Obispo county
- **Responsive Design** - Works on desktop and mobile devices
- **CI/CD Pipeline** - Automated testing and deployment via GitHub Actions

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 19+ with TypeScript, Leaflet.js, CSS3
- **Backend**: Spring Boot 2.7+, Java 11+, Maven
- **Deployment**: Google Cloud Storage (frontend), Google Cloud Run (backend)
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Mapping**: OpenStreetMap with local tile caching

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Browser  │────│  Google Cloud    │────│  Google Cloud   │
│                 │    │  Storage         │    │  Run            │
│                 │    │  (Frontend)      │    │  (Backend)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Repository Structure

This project contains two separate applications:

### Frontend (`slo-view-frontend/`)
- React TypeScript application with Leaflet.js mapping
- Navigation bar with "SLO View" title
- Interactive map viewer with drag and zoom
- Responsive design for all screen sizes

### Backend (`slo-view-backend/`)
- Spring Boot REST API
- Health check endpoint at `/health`
- Containerized for Google Cloud Run deployment
- Minimal MVP implementation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java 11+
- Maven 3.6+
- Docker Desktop
- Google Cloud SDK
- Git

### Automated Setup (Recommended)

**Windows:**
```cmd
scripts\setup-gcp-infrastructure.bat
scripts\deploy-applications.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-gcp-infrastructure.sh
./scripts/setup-gcp-infrastructure.sh
```

### Manual Setup
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions.

## 📚 Documentation

### Architecture & Planning
- [System Architecture](architecture.md) - Complete system architecture and technical specifications

### Development & Deployment
- [GitHub Workflow](github-workflow.md) - Development process and collaboration
- [Deployment Guide](DEPLOYMENT.md) - Complete setup and deployment documentation

### Application Documentation
- [Frontend README](slo-view-frontend/README.md) - React TypeScript application details
- [Backend README](slo-view-backend/README.md) - Spring Boot API documentation

## 🛠️ Development

### Local Development

**Frontend:**
```bash
cd slo-view-frontend
npm install
npm start
```

**Backend:**
```bash
cd slo-view-backend
mvn spring-boot:run
```

### Testing

**Frontend:**
```bash
cd slo-view-frontend
npm test
```

**Backend:**
```bash
cd slo-view-backend
mvn test
```

### Building

**Frontend:**
```bash
cd slo-view-frontend
npm run build
```

**Backend:**
```bash
cd slo-view-backend
mvn clean package
```

## 🌐 Deployment

### Google Cloud Infrastructure
- **Frontend**: Static hosting in Google Cloud Storage
- **Backend**: Containerized deployment to Google Cloud Run
- **CI/CD**: Automated deployment via GitHub Actions
- **Monitoring**: Built-in Google Cloud monitoring and logging

### Environment URLs
- **Frontend**: `https://storage.googleapis.com/slo-view-frontend/index.html`
- **Backend API**: `https://slo-view-backend-[hash]-uc.a.run.app/health`

## 🔧 Configuration

### Required Environment Variables
- `GCP_PROJECT_ID`: Google Cloud project ID
- `GCP_SA_KEY`: Service account key for CI/CD
- `GCP_BUCKET_NAME`: Cloud Storage bucket name

### GitHub Secrets
Add these secrets to your GitHub repository for CI/CD:
- `GCP_PROJECT_ID`
- `GCP_SA_KEY`
- `GCP_BUCKET_NAME`

## 🧪 Testing

### Test Coverage
- **Frontend**: Jest + React Testing Library
- **Backend**: JUnit + MockMvc
- **Integration**: Automated testing in CI/CD pipeline
- **Manual**: Health checks and deployment verification

### Running Tests
```bash
# Frontend tests
cd slo-view-frontend && npm test

# Backend tests
cd slo-view-backend && mvn test

# Verify deployment
scripts\verify-deployment.bat  # Windows
```

## 📊 Features

### ✅ Implemented Features
- [x] React TypeScript frontend with responsive design
- [x] Spring Boot backend with health check endpoint
- [x] Interactive map with OpenStreetMap and Leaflet.js
- [x] Drag and zoom functionality
- [x] Navigation bar with "SLO View" title
- [x] Google Cloud deployment infrastructure
- [x] CI/CD pipeline with GitHub Actions
- [x] Comprehensive testing framework
- [x] Docker containerization
- [x] Local tile caching for performance

### 🔮 Future Enhancements
- [ ] Custom map styling for SLO county
- [ ] Additional map layers (satellite, terrain)
- [ ] User location detection
- [ ] Map markers for points of interest
- [ ] Search functionality
- [ ] Mobile app version
- [ ] Advanced caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [GitHub Workflow](github-workflow.md) for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section in [DEPLOYMENT.md](DEPLOYMENT.md)
2. Review the [GitHub Workflow](github-workflow.md) for development processes
3. Check GitHub Issues for known problems
4. Contact the development team

## 🎉 Acknowledgments

- OpenStreetMap contributors for free map data
- Leaflet.js team for the excellent mapping library
- Google Cloud Platform for hosting infrastructure
- React and Spring Boot communities for excellent frameworks