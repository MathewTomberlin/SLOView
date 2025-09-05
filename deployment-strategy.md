# Deployment Strategy for SLO View Application

## Overview
This document outlines the deployment strategy for the SLO View application, which consists of a React frontend hosted in Google Cloud Storage and a Spring Boot backend hosted in Google Cloud Run.

## Frontend Deployment (Google Cloud Storage)

### Hosting Configuration
1. **Static Website Hosting**
   - Google Cloud Storage bucket configured for static website hosting
   - Custom domain configuration (if applicable)
   - SSL certificate via Google Cloud Load Balancer

2. **Bucket Setup**
   - Create bucket with uniform bucket-level access
   - Enable versioning for rollback capabilities
   - Configure lifecycle rules for cost optimization
   - Set appropriate IAM permissions

3. **Performance Optimization**
   - Enable CDN through Cloud CDN or third-party CDN
   - Configure caching headers for static assets
   - Compress assets (gzip/brotli) during build process

### Deployment Process

#### Manual Deployment
1. Build React application: `npm run build`
2. Upload contents of `build/` directory to Cloud Storage bucket
3. Set `index.html` as main page and error page
4. Configure CORS settings if needed

#### Automated Deployment (CI/CD)
1. GitHub Actions workflow triggered on push to `main` branch
2. Build React application in CI environment
3. Authenticate with Google Cloud using service account
4. Sync build artifacts to Cloud Storage bucket using `gsutil`
5. Optional: Invalidate CDN cache after deployment

### Security Considerations
1. Restrict bucket access to only necessary users
2. Enable Cloud Storage logging for access monitoring
3. Use Cloud Armor for DDoS protection (if needed)
4. Implement Content Security Policy (CSP) in application

## Backend Deployment (Google Cloud Run)

### Containerization
1. **Docker Configuration**
   - Multi-stage Dockerfile for optimized image size
   - Use official OpenJDK base image
   - Non-root user for security
   - Proper resource limits and health checks

2. **Container Image Management**
   - Store images in Google Container Registry (GCR) or Artifact Registry
   - Tag images with semantic versioning
   - Regular security scanning of base images

### Cloud Run Configuration
1. **Service Configuration**
   - Set appropriate memory and CPU allocation
   - Configure concurrency settings
   - Set maximum request timeout
   - Enable automatic scaling

2. **Environment Variables**
   - Configure through Cloud Run service settings
   - Use Secret Manager for sensitive data
   - Environment-specific configurations

3. **Networking**
   - Ingress settings (allow internal/external traffic)
   - VPC connector if backend needs to access VPC resources
   - Custom domain mapping (if applicable)

### Deployment Process

#### Manual Deployment
1. Build JAR file: `mvn clean package`
2. Build Docker image: `docker build -t gcr.io/PROJECT-ID/slo-view-backend .`
3. Push image to Container Registry: `docker push gcr.io/PROJECT-ID/slo-view-backend`
4. Deploy to Cloud Run:
   ```
   gcloud run deploy slo-view-backend \
     --image gcr.io/PROJECT-ID/slo-view-backend \
     --platform managed \
     --region REGION \
     --allow-unauthenticated
   ```

#### Automated Deployment (CI/CD)
1. GitHub Actions workflow triggered on push to `main` branch
2. Build JAR file in CI environment
3. Build and push Docker image to Container Registry
4. Deploy updated image to Cloud Run using gcloud CLI
5. Optional: Run integration tests against deployed service

### Security Considerations
1. Use least privilege service accounts
2. Enable Cloud Run authentication if backend shouldn't be publicly accessible
3. Implement proper input validation in API endpoints
4. Regular security updates for base images
5. Enable Cloud Run logging and monitoring

## Cost Optimization

### Google Cloud Storage
1. **Free Tier Utilization**
   - Store under 5GB of data
   - Keep monthly egress under 1GB
   - Limit operations to free tier limits

2. **Cost Management**
   - Use lifecycle policies to delete old versions
   - Enable object versioning only if needed
   - Monitor usage with Cloud Monitoring

### Google Cloud Run
1. **Free Tier Utilization**
   - Monthly runtime under 180,000 vCPU-seconds
   - Monthly requests under 2 million
   - Egress within Google Cloud network is free

2. **Cost Management**
   - Set appropriate resource limits
   - Configure concurrency to maximize resource utilization
   - Use Cloud Monitoring to track usage

## Monitoring and Logging

### Frontend Monitoring
1. Google Cloud Storage access logs
2. CDN performance monitoring
3. Client-side error tracking (optional)

### Backend Monitoring
1. Cloud Run built-in metrics
2. Custom application logs
3. Health check monitoring
4. Error rate tracking

### Alerting
1. Configure alerts for:
   - High error rates
   - Performance degradation
   - Resource utilization thresholds
   - Downtime detection

## Disaster Recovery

### Frontend Recovery
1. Versioned Cloud Storage objects
2. Backup of static assets
3. Quick redeployment process

### Backend Recovery
1. Previous revision rollback in Cloud Run
2. Database backup strategy (if applicable in future)
3. Configuration backup

## Rollback Procedures

### Frontend Rollback
1. Revert Cloud Storage contents to previous version
2. If versioning enabled, restore previous objects
3. If using CDN, invalidate cache

### Backend Rollback
1. Deploy previous container image revision
2. Use Cloud Run revision management
3. Update traffic allocation to previous revision

## Environment Strategy

### Development Environment
1. Separate Cloud Storage bucket for testing
2. Separate Cloud Run service for development
3. Different domain or path for access

### Production Environment
1. Primary Cloud Storage bucket
2. Primary Cloud Run service
3. Custom domain configuration

## CI/CD Pipeline Integration

### Frontend Pipeline
```yaml
# GitHub Actions workflow example
name: Deploy Frontend
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build
    - name: Deploy to Cloud Storage
      run: |
        gcloud auth configure-docker
        gsutil -m rsync -r -d ./build gs://BUCKET_NAME
```

### Backend Pipeline
```yaml
# GitHub Actions workflow example
name: Deploy Backend
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'adopt'
    - name: Build with Maven
      run: mvn clean package
    - name: Build and push Docker image
      run: |
        docker build -t gcr.io/PROJECT-ID/slo-view-backend .
        docker push gcr.io/PROJECT-ID/slo-view-backend
    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy slo-view-backend \
          --image gcr.io/PROJECT-ID/slo-view-backend \
          --platform managed \
          --region REGION \
          --allow-unauthenticated
```

## Testing Strategy for Deployments

### Pre-deployment Testing
1. Unit tests in CI pipeline
2. Integration tests for backend API
3. End-to-end tests for critical user flows

### Post-deployment Testing
1. Health check verification
2. Smoke tests for critical functionality
3. Performance testing for new deployments

## Maintenance Procedures

### Regular Maintenance
1. Update dependencies regularly
2. Review and optimize costs
3. Update security configurations
4. Review access controls

### Updates and Patches
1. Base image updates
2. Security patches
3. Dependency updates
4. Configuration changes

## Troubleshooting Guide

### Common Frontend Issues
1. Incorrect bucket permissions
2. CORS configuration issues
3. CDN caching problems
4. SSL certificate issues

### Common Backend Issues
1. Container image deployment failures
2. Resource allocation issues
3. Authentication/authorization problems
4. Environment variable misconfigurations

### Diagnostic Steps
1. Check Cloud Storage access logs
2. Review Cloud Run logs and metrics
3. Verify service configurations
4. Test connectivity between services