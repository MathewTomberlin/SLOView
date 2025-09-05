# SLO View - Setup Instructions

This document provides step-by-step instructions for setting up the complete SLO View application infrastructure and deployment.

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Java Development Kit** (JDK 11 or higher)
   - Download from: https://adoptium.net/
   - Verify installation: `java -version`

3. **Maven** (v3.6 or higher)
   - Download from: https://maven.apache.org/download.cgi
   - Verify installation: `mvn --version`

4. **Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify installation: `docker --version`

5. **Google Cloud SDK**
   - Download from: https://cloud.google.com/sdk/docs/install
   - Verify installation: `gcloud --version`

6. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

### Required Accounts
1. **Google Cloud Platform Account**
   - Sign up at: https://cloud.google.com/
   - Enable billing for your account

2. **GitHub Account**
   - Sign up at: https://github.com/

## Quick Setup (Automated)

### Option 1: Windows Users
1. Open Command Prompt or PowerShell as Administrator
2. Navigate to the project directory
3. Run the setup script:
   ```cmd
   setup-gcp-infrastructure.bat
   ```
4. Follow the prompts and wait for completion
5. Deploy applications:
   ```cmd
   deploy-applications.bat
   ```

### Option 2: Linux/Mac Users
1. Open Terminal
2. Navigate to the project directory
3. Make the script executable:
   ```bash
   chmod +x setup-gcp-infrastructure.sh
   ```
4. Run the setup script:
   ```bash
   ./setup-gcp-infrastructure.sh
   ```

## Manual Setup (Step-by-Step)

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
       --region us-central1 \
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

1. **Create a new GitHub repository** (if not already done)

2. **Add repository secrets:**
   - Go to your repository settings
   - Navigate to "Secrets and variables" → "Actions"
   - Add the following secrets:
     - `GCP_PROJECT_ID`: `slo-view-app`
     - `GCP_SA_KEY`: (contents of `slo-view-cicd-key.json`)
     - `GCP_BUCKET_NAME`: `slo-view-frontend`

3. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit with complete SLO View application"
   git push origin main
   ```

## Verification

### Test Backend
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

### Test Frontend
```bash
# Test the website
curl -I https://storage.googleapis.com/slo-view-frontend/index.html
```

## Troubleshooting

### Common Issues

1. **"Project not found" error:**
   - Ensure you've set the correct project: `gcloud config set project slo-view-app`
   - Verify project exists: `gcloud projects list`

2. **"Permission denied" errors:**
   - Check service account permissions
   - Ensure APIs are enabled
   - Verify authentication: `gcloud auth list`

3. **Docker build failures:**
   - Ensure Docker Desktop is running
   - Check Docker daemon status: `docker info`

4. **Maven build failures:**
   - Verify Java version: `java -version`
   - Check Maven installation: `mvn --version`

5. **npm build failures:**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Getting Help

1. Check the logs in Google Cloud Console
2. Review the GitHub Actions workflow logs
3. Verify all prerequisites are installed correctly
4. Ensure all environment variables and secrets are set

## Next Steps

After successful setup:

1. **Monitor deployments** in Google Cloud Console
2. **Set up custom domain** (optional)
3. **Configure monitoring and alerting**
4. **Implement additional features**
5. **Set up staging environment**

## Security Notes

- Never commit the service account key file to version control
- Use environment variables for sensitive configuration
- Regularly rotate service account keys
- Monitor access logs and usage
- Keep dependencies updated for security patches
