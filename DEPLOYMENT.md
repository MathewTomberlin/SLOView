# SLO View - Complete Deployment Guide

This comprehensive guide covers everything needed to deploy the SLO View application to Google Cloud Platform, from initial setup to production deployment.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Setup (Automated)](#quick-setup-automated)
- [Manual Setup](#manual-setup)
- [Deployment Strategy](#deployment-strategy)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Java Development Kit** (JDK 11 or higher) - [Download](https://adoptium.net/)
3. **Maven** (v3.6 or higher) - [Download](https://maven.apache.org/download.cgi)
4. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
5. **Google Cloud SDK** - [Download](https://cloud.google.com/sdk/docs/install)
6. **Git** - [Download](https://git-scm.com/)

### Required Accounts
1. **Google Cloud Platform Account** - [Sign up](https://cloud.google.com/) (enable billing)
2. **GitHub Account** - [Sign up](https://github.com/)

### Required APIs
- Google Cloud Run API
- Google Cloud Storage API
- Google Container Registry API
- Google Cloud Build API

## Quick Setup (Automated)

### Windows Users
```cmd
# Set up Google Cloud infrastructure
scripts\setup-gcp-infrastructure.bat

# Deploy applications
scripts\deploy-applications.bat

# Verify deployment
scripts\verify-deployment.bat
```

### Linux/Mac Users
```bash
# Make script executable and run setup
chmod +x scripts/setup-gcp-infrastructure.sh
./scripts/setup-gcp-infrastructure.sh
```

## Manual Setup

### Step 1: Google Cloud Project Setup

1. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth login
   ```

2. **Create a new project:**
   ```bash
   gcloud projects create slo-view-app --name="SLO View Application"
   gcloud config set project slo-view-app
   ```

3. **Enable required APIs:**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable storage.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

### Step 2: Service Account Setup

1. **Create service account:**
   ```bash
   gcloud iam service-accounts create slo-view-cicd \
       --description="Service account for SLO View CI/CD" \
       --display-name="SLO View CI/CD"
   ```

2. **Grant permissions:**
   ```bash
   gcloud projects add-iam-policy-binding slo-view-app \
       --member="serviceAccount:slo-view-cicd@slo-view-app.iam.gserviceaccount.com" \
       --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding slo-view-app \
       --member="serviceAccount:slo-view-cicd@slo-view-app.iam.gserviceaccount.com" \
       --role="roles/storage.admin"
   
   gcloud projects add-iam-policy-binding slo-view-app \
       --member="serviceAccount:slo-view-cicd@slo-view-app.iam.gserviceaccount.com" \
       --role="roles/iam.serviceAccountUser"
   ```

3. **Create and download service account key:**
   ```bash
   gcloud iam service-accounts keys create slo-view-cicd-key.json \
       --iam-account=slo-view-cicd@slo-view-app.iam.gserviceaccount.com
   ```

### Step 3: Cloud Storage Setup

1. **Create bucket for frontend:**
   ```bash
   gsutil mb gs://slo-view-frontend
   ```

2. **Configure for static website hosting:**
   ```bash
   gsutil web set -m index.html -e index.html gs://slo-view-frontend
   gsutil iam ch allUsers:objectViewer gs://slo-view-frontend
   ```

### Step 4: Backend Deployment

1. **Navigate to backend directory:**
   ```bash
   cd slo-view-backend
   ```

2. **Build the application:**
   ```bash
   mvn clean package
   ```

3. **Build Docker image:**
   ```bash
   docker build -t gcr.io/slo-view-app/slo-view-backend .
   ```

4. **Push to Container Registry:**
   ```bash
   docker push gcr.io/slo-view-app/slo-view-backend
   ```

5. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy slo-view-backend \
       --image gcr.io/slo-view-app/slo-view-backend \
       --platform managed \
       --region us-west1 \
       --allow-unauthenticated \
       --port 8080 \
       --memory 512Mi \
       --cpu 1 \
       --max-instances 10
   ```

### Step 5: Frontend Deployment

1. **Navigate to frontend directory:**
   ```bash
   cd ../slo-view-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Deploy to Cloud Storage:**
   ```bash
   gsutil -m rsync -r -d build/ gs://slo-view-frontend/
   ```

### Step 6: GitHub Repository Setup

1. **Add repository secrets:**
   - Go to your repository settings
   - Navigate to "Secrets and variables" → "Actions"
   - Add the following secrets:
     - `GCP_PROJECT_ID`: `slo-view-app`
     - `GCP_SA_KEY`: (contents of `slo-view-cicd-key.json`)
     - `GCP_BUCKET_NAME`: `slo-view-frontend`

2. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit with complete SLO View application"
   git push origin main
   ```

## Deployment Strategy

### Architecture Overview
- **Frontend**: React app hosted in Google Cloud Storage (static website)
- **Backend**: Spring Boot API hosted in Google Cloud Run (serverless containers)
- **CI/CD**: GitHub Actions for automated testing and deployment

### Frontend Deployment (Google Cloud Storage)
- Static website hosting with automatic HTTPS
- CDN-ready for global performance
- Versioning enabled for rollback capabilities
- Public access for web serving

### Backend Deployment (Google Cloud Run)
- Containerized Spring Boot application
- Auto-scaling based on traffic
- Serverless with pay-per-use pricing
- Health checks and monitoring built-in

### CI/CD Pipeline
- **Frontend**: Automated build and deployment to Cloud Storage
- **Backend**: Automated Docker build and deployment to Cloud Run
- **Testing**: Unit tests run before deployment
- **Security**: Service account authentication

## Monitoring & Maintenance

### Health Checks
```bash
# Test backend health
SERVICE_URL=$(gcloud run services describe slo-view-backend \
    --platform managed \
    --region us-west1 \
    --format 'value(status.url)')
curl $SERVICE_URL/health

# Test frontend
curl -I https://storage.googleapis.com/slo-view-frontend/index.html
```

### Monitoring Commands
```bash
# View service logs
gcloud logs read --service slo-view-backend --limit 50

# Check service status
gcloud run services list

# View bucket contents
gsutil ls -la gs://slo-view-frontend
```

### Cost Optimization
- **Cloud Run**: Set minimum instances to 0 for cost savings
- **Cloud Storage**: Use lifecycle policies for old versions
- **Monitoring**: Set up billing alerts and usage tracking

### Security Best Practices
- Use least privilege service accounts
- Rotate service account keys regularly
- Enable audit logging
- Monitor access patterns
- Keep dependencies updated

## Troubleshooting

### Common Issues

1. **"Project not found" error:**
   - Ensure correct project: `gcloud config set project slo-view-app`
   - Verify project exists: `gcloud projects list`

2. **"Permission denied" errors:**
   - Check service account permissions
   - Ensure APIs are enabled
   - Verify authentication: `gcloud auth list`

3. **Docker build failures:**
   - Ensure Docker Desktop is running
   - Check Docker daemon: `docker info`

4. **Build failures:**
   - Frontend: Clear npm cache and reinstall dependencies
   - Backend: Verify Java and Maven versions

5. **Deployment failures:**
   - Check Cloud Run service limits
   - Verify environment variables
   - Review GitHub Actions logs

### Getting Help
1. Check Google Cloud Console logs
2. Review GitHub Actions workflow logs
3. Verify all prerequisites are installed
4. Ensure all environment variables are set

## Next Steps

After successful deployment:
1. Set up monitoring and alerting
2. Configure custom domain (optional)
3. Implement additional features
4. Set up staging environment
5. Plan for scaling and optimization

## Security Notes

- Never commit service account keys to version control
- Use environment variables for sensitive configuration
- Regularly rotate service account keys
- Monitor access logs and usage
- Keep dependencies updated for security patches
