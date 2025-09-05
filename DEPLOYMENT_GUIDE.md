# SLO View Deployment Guide

This guide provides step-by-step instructions for deploying the SLO View application to Google Cloud Platform.

## Prerequisites

1. **Google Cloud Platform Account**
   - Create a GCP account at [cloud.google.com](https://cloud.google.com)
   - Enable billing for your project

2. **Required APIs**
   - Google Cloud Run API
   - Google Cloud Storage API
   - Google Container Registry API

3. **Tools**
   - Google Cloud SDK (`gcloud` CLI)
   - Docker (for local testing)
   - Git

## Project Setup

### 1. Create Google Cloud Project

```bash
# Create a new project
gcloud projects create slo-view-app --name="SLO View Application"

# Set the project as default
gcloud config set project slo-view-app

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Create Service Account

```bash
# Create service account for CI/CD
gcloud iam service-accounts create slo-view-cicd \
    --description="Service account for SLO View CI/CD" \
    --display-name="SLO View CI/CD"

# Grant necessary permissions
gcloud projects add-iam-policy-binding slo-view-app \
    --member="serviceAccount:slo-view-cicd@slo-view-app.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding slo-view-app \
    --member="serviceAccount:slo-view-cicd@slo-view-app.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding slo-view-app \
    --member="serviceAccount:slo-view-cicd@slo-view-app.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Create and download service account key
gcloud iam service-accounts keys create slo-view-cicd-key.json \
    --iam-account=slo-view-cicd@slo-view-app.iam.gserviceaccount.com
```

### 3. Create Cloud Storage Bucket

```bash
# Create bucket for frontend hosting
gsutil mb gs://slo-view-frontend

# Configure bucket for static website hosting
gsutil web set -m index.html -e index.html gs://slo-view-frontend

# Set public access
gsutil iam ch allUsers:objectViewer gs://slo-view-frontend
```

## Backend Deployment

### 1. Manual Deployment

```bash
cd slo-view-backend

# Build the application
mvn clean package

# Build Docker image
docker build -t gcr.io/slo-view-app/slo-view-backend .

# Push to Container Registry
docker push gcr.io/slo-view-app/slo-view-backend

# Deploy to Cloud Run
gcloud run deploy slo-view-backend \
    --image gcr.io/slo-view-app/slo-view-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10
```

### 2. Verify Backend Deployment

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe slo-view-backend \
    --platform managed \
    --region us-central1 \
    --format 'value(status.url)')

# Test the health endpoint
curl $SERVICE_URL/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "slo-view-backend",
  "timestamp": "1234567890123"
}
```

## Frontend Deployment

### 1. Manual Deployment

```bash
cd slo-view-frontend

# Install dependencies
npm install

# Build the application
npm run build

# Deploy to Cloud Storage
gsutil -m rsync -r -d build/ gs://slo-view-frontend/
```

### 2. Verify Frontend Deployment

```bash
# Get the website URL
WEBSITE_URL="https://storage.googleapis.com/slo-view-frontend/index.html"

# Test the website
curl -I $WEBSITE_URL
```

## GitHub Actions Setup

### 1. Repository Secrets

Add the following secrets to your GitHub repository:

- `GCP_PROJECT_ID`: `slo-view-app`
- `GCP_SA_KEY`: Contents of `slo-view-cicd-key.json`
- `GCP_BUCKET_NAME`: `slo-view-frontend`

### 2. Enable GitHub Actions

1. Push your code to GitHub
2. Go to your repository's Actions tab
3. Enable GitHub Actions if prompted
4. The CI/CD pipelines will run automatically on push/PR

## Custom Domain Setup (Optional)

### 1. Configure Custom Domain

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
    --service slo-view-backend \
    --domain api.sloview.com \
    --region us-central1

# Map custom domain to Cloud Storage
gsutil web set -m index.html -e index.html gs://slo-view-frontend
```

### 2. SSL Certificate

Google Cloud automatically provides SSL certificates for custom domains.

## Monitoring and Logging

### 1. Cloud Run Monitoring

```bash
# View service logs
gcloud logs read --service slo-view-backend --limit 50

# View service metrics
gcloud monitoring metrics list --filter="resource.type=cloud_run_revision"
```

### 2. Cloud Storage Monitoring

```bash
# View bucket access logs
gsutil logging get gs://slo-view-frontend
```

## Cost Optimization

### 1. Cloud Run Settings

- Set appropriate memory limits (512Mi for backend)
- Configure concurrency settings
- Use minimum instances: 0 (for cost savings)

### 2. Cloud Storage Settings

- Enable lifecycle policies for old versions
- Use appropriate storage classes
- Monitor usage with Cloud Monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check service account permissions
   - Verify API enablement
   - Review build logs in GitHub Actions

2. **Deployment Failures**
   - Ensure Docker image builds successfully
   - Check Cloud Run service limits
   - Verify environment variables

3. **Access Issues**
   - Check IAM permissions
   - Verify bucket public access settings
   - Review CORS configuration if needed

### Useful Commands

```bash
# Check service status
gcloud run services list

# View service details
gcloud run services describe slo-view-backend --region us-central1

# Check bucket contents
gsutil ls -la gs://slo-view-frontend

# View recent logs
gcloud logs read --limit 100 --format json
```

## Security Considerations

1. **Service Account Security**
   - Use least privilege principle
   - Rotate keys regularly
   - Monitor service account usage

2. **Network Security**
   - Use HTTPS for all communications
   - Configure appropriate CORS policies
   - Implement rate limiting if needed

3. **Data Protection**
   - No sensitive data in frontend
   - Use environment variables for configuration
   - Enable audit logging

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   - Monitor security advisories
   - Update packages regularly
   - Test updates in development

2. **Monitor Costs**
   - Review monthly billing
   - Optimize resource usage
   - Set up billing alerts

3. **Backup and Recovery**
   - Backup configuration files
   - Document deployment procedures
   - Test disaster recovery procedures

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Google Cloud documentation
3. Check GitHub Issues for known problems
4. Contact the development team

## Next Steps

After successful deployment:

1. Set up monitoring and alerting
2. Configure custom domain (if needed)
3. Implement additional features
4. Set up staging environment
5. Plan for scaling and optimization
