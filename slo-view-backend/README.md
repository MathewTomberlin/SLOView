# SLO View Backend

A Spring Boot REST API backend for the SLO View application, providing health check endpoints and serving as the foundation for future API functionality.

## Overview

The SLO View Backend is a minimal Spring Boot application that provides:
- Health check endpoint at `/health`
- RESTful API structure for future expansion
- Containerized deployment ready for Google Cloud Run

## Technology Stack

- **Framework**: Spring Boot 2.7.18
- **Java Version**: 11
- **Build Tool**: Maven
- **Containerization**: Docker
- **Testing**: JUnit 5, MockMvc

## API Endpoints

### Health Check
- **Endpoint**: `GET /health`
- **Description**: Returns the health status of the service
- **Response**: 
  ```json
  {
    "status": "UP",
    "service": "slo-view-backend",
    "timestamp": "1234567890123"
  }
  ```

## Development Setup

### Prerequisites
- Java 11 or higher
- Maven 3.6 or higher
- Docker (optional, for containerization)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slo-view-backend
   ```

2. **Install dependencies**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. **Test the health endpoint**
   ```bash
   curl http://localhost:8080/health
   ```

### Running Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=HealthControllerTest

# Run with coverage
mvn test jacoco:report
```

## Docker

### Build Docker Image

```bash
docker build -t slo-view-backend .
```

### Run Container

```bash
docker run -p 8080:8080 slo-view-backend
```

## Deployment

### Google Cloud Run

The application is configured for deployment to Google Cloud Run:

1. **Build and push to Container Registry**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/slo-view-backend
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy slo-view-backend \
     --image gcr.io/PROJECT-ID/slo-view-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## Configuration

Application configuration is managed through `application.properties`:

- **Server Port**: 8080 (default)
- **Health Check**: Exposed at `/health`
- **Logging**: INFO level for application and web layers

## Project Structure

```
slo-view-backend/
├── src/
│   ├── main/
│   │   ├── java/com/sloview/
│   │   │   ├── SLOViewApplication.java
│   │   │   └── controller/
│   │   │       └── HealthController.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/sloview/
│           └── controller/
│               └── HealthControllerTest.java
├── pom.xml
├── Dockerfile
└── README.md
```

## Contributing

1. Create a feature branch from `develop`
2. Make your changes with appropriate tests
3. Ensure all tests pass: `mvn test`
4. Create a pull request to `develop`
5. Follow conventional commit format for commit messages

## License

This project is part of the SLO View application suite.
