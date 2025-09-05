#!/bin/bash

# SLO View - Google Cloud Infrastructure Setup Script
# This script sets up the complete Google Cloud infrastructure for the SLO View application

set -e  # Exit on any error

# Configuration variables
PROJECT_ID="slo-view-app"
PROJECT_NAME="SLO View Application"
REGION="us-west1"
SERVICE_ACCOUNT_NAME="slo-view-cicd"
BUCKET_NAME="slo-view-frontend"
BACKEND_SERVICE_NAME="slo-view-backend"

echo "🚀 Setting up Google Cloud infrastructure for SLO View..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with Google Cloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

echo "✅ Google Cloud SDK is installed and authenticated"

# Create project (if it doesn't exist)
echo "📋 Creating Google Cloud project..."
if gcloud projects describe $PROJECT_ID &> /dev/null; then
    echo "✅ Project $PROJECT_ID already exists"
else
    gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"
    echo "✅ Created project $PROJECT_ID"
fi

# Set the project as default
gcloud config set project $PROJECT_ID
echo "✅ Set $PROJECT_ID as default project"

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
echo "✅ Enabled required APIs"

# Create service account for CI/CD
echo "👤 Creating service account for CI/CD..."
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com &> /dev/null; then
    echo "✅ Service account $SERVICE_ACCOUNT_NAME already exists"
else
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --description="Service account for SLO View CI/CD" \
        --display-name="SLO View CI/CD"
    echo "✅ Created service account $SERVICE_ACCOUNT_NAME"
fi

# Grant necessary permissions to service account
echo "🔐 Granting permissions to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.builder"

echo "✅ Granted permissions to service account"

# Create and download service account key
echo "🔑 Creating service account key..."
if [ ! -f "slo-view-cicd-key.json" ]; then
    gcloud iam service-accounts keys create slo-view-cicd-key.json \
        --iam-account=$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com
    echo "✅ Created service account key: slo-view-cicd-key.json"
else
    echo "✅ Service account key already exists: slo-view-cicd-key.json"
fi

# Create Cloud Storage bucket for frontend
echo "🪣 Creating Cloud Storage bucket for frontend..."
if gsutil ls -b gs://$BUCKET_NAME &> /dev/null; then
    echo "✅ Bucket gs://$BUCKET_NAME already exists"
else
    gsutil mb gs://$BUCKET_NAME
    echo "✅ Created bucket gs://$BUCKET_NAME"
fi

# Configure bucket for static website hosting
echo "🌐 Configuring bucket for static website hosting..."
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
echo "✅ Configured bucket for static website hosting"

# Create a simple test deployment for backend
echo "🚀 Creating initial backend deployment..."
cd slo-view-backend

# Build the application
echo "🔨 Building backend application..."
mvn clean package -DskipTests

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME .

# Push to Container Registry
echo "📤 Pushing Docker image to Container Registry..."
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars ENVIRONMENT=production

# Get the service URL
SERVICE_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --format 'value(status.url)')

echo "✅ Backend deployed to: $SERVICE_URL"

# Test the health endpoint
echo "🔍 Testing backend health endpoint..."
if curl -f $SERVICE_URL/health; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

cd ..

# Deploy frontend
echo "🌐 Deploying frontend to Cloud Storage..."
cd slo-view-frontend

# Build the application
echo "🔨 Building frontend application..."
npm run build

# Deploy to Cloud Storage
echo "📤 Deploying to Cloud Storage..."
gsutil -m rsync -r -d build/ gs://$BUCKET_NAME/

# Get the website URL
WEBSITE_URL="https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo "✅ Frontend deployed to: $WEBSITE_URL"

# Test the website
echo "🔍 Testing frontend deployment..."
if curl -f -I $WEBSITE_URL; then
    echo "✅ Frontend deployment test passed"
else
    echo "❌ Frontend deployment test failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Google Cloud infrastructure setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "   Project ID: $PROJECT_ID"
echo "   Backend URL: $SERVICE_URL"
echo "   Frontend URL: $WEBSITE_URL"
echo "   Service Account Key: slo-view-cicd-key.json"
echo ""
echo "🔧 Next steps:"
echo "   1. Add the following secrets to your GitHub repository:"
echo "      - GCP_PROJECT_ID: $PROJECT_ID"
echo "      - GCP_SA_KEY: (contents of slo-view-cicd-key.json)"
echo "      - GCP_BUCKET_NAME: $BUCKET_NAME"
echo ""
echo "   2. Push your code to GitHub to trigger the CI/CD pipeline"
echo ""
echo "   3. Monitor deployments in the Google Cloud Console:"
echo "      - Cloud Run: https://console.cloud.google.com/run"
echo "      - Cloud Storage: https://console.cloud.google.com/storage"
echo ""
echo "⚠️  Important: Keep the service account key file secure and never commit it to version control!"
