# SLO View - Google Cloud Infrastructure Setup Script (PowerShell)
# This script sets up the complete Google Cloud infrastructure for the SLO View application

# Configuration variables
$PROJECT_ID = "slo-view-app"
$PROJECT_NAME = "SLO View Application"
$REGION = "us-west1"
$SERVICE_ACCOUNT_NAME = "slo-view-cicd"
$BUCKET_NAME = "slo-view-frontend"
$BACKEND_SERVICE_NAME = "slo-view-backend"

Write-Host "🚀 Setting up Google Cloud infrastructure for SLO View..." -ForegroundColor Green

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "gcloud not found"
    }
    Write-Host "✅ Google Cloud SDK is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud SDK is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated
try {
    $activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if (-not $activeAccount) {
        throw "No active account"
    }
    Write-Host "✅ Google Cloud SDK is authenticated as: $activeAccount" -ForegroundColor Green
} catch {
    Write-Host "❌ Not authenticated with Google Cloud. Please run:" -ForegroundColor Red
    Write-Host "   gcloud auth login" -ForegroundColor Yellow
    exit 1
}

# Create project (if it doesn't exist)
Write-Host "📋 Creating Google Cloud project..." -ForegroundColor Cyan
try {
    gcloud projects describe $PROJECT_ID 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Project $PROJECT_ID already exists" -ForegroundColor Green
    } else {
        gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"
        Write-Host "✅ Created project $PROJECT_ID" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to create project: $_" -ForegroundColor Red
    exit 1
}

# Set the project as default
Write-Host "🔧 Setting default project..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID
gcloud auth application-default set-quota-project $PROJECT_ID
Write-Host "✅ Set $PROJECT_ID as default project" -ForegroundColor Green

# Enable required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Cyan
try {
    gcloud services enable run.googleapis.com
    gcloud services enable storage.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    Write-Host "✅ Enabled required APIs" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to enable APIs. Make sure billing is enabled for your project." -ForegroundColor Red
    Write-Host "   Go to: https://console.cloud.google.com/billing" -ForegroundColor Yellow
    exit 1
}

# Create service account for CI/CD
Write-Host "👤 Creating service account for CI/CD..." -ForegroundColor Cyan
try {
    gcloud iam service-accounts describe "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Service account $SERVICE_ACCOUNT_NAME already exists" -ForegroundColor Green
    } else {
        gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME --description="Service account for SLO View CI/CD" --display-name="SLO View CI/CD"
        Write-Host "✅ Created service account $SERVICE_ACCOUNT_NAME" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to create service account: $_" -ForegroundColor Red
    exit 1
}

# Grant necessary permissions to service account
Write-Host "🔐 Granting permissions to service account..." -ForegroundColor Cyan
try {
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/run.admin"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/storage.admin"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/cloudbuild.builds.builder"
    Write-Host "✅ Granted permissions to service account" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to grant permissions: $_" -ForegroundColor Red
    exit 1
}

# Create and download service account key
Write-Host "🔑 Creating service account key..." -ForegroundColor Cyan
if (-not (Test-Path "slo-view-cicd-key.json")) {
    try {
        gcloud iam service-accounts keys create slo-view-cicd-key.json --iam-account="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
        Write-Host "✅ Created service account key: slo-view-cicd-key.json" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create service account key: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Service account key already exists: slo-view-cicd-key.json" -ForegroundColor Green
}

# Create Cloud Storage bucket for frontend
Write-Host "🪣 Creating Cloud Storage bucket for frontend..." -ForegroundColor Cyan
try {
    gsutil ls -b "gs://$BUCKET_NAME" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Bucket gs://$BUCKET_NAME already exists" -ForegroundColor Green
    } else {
        gsutil mb "gs://$BUCKET_NAME"
        Write-Host "✅ Created bucket gs://$BUCKET_NAME" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to create bucket: $_" -ForegroundColor Red
    exit 1
}

# Configure bucket for static website hosting
Write-Host "🌐 Configuring bucket for static website hosting..." -ForegroundColor Cyan
try {
    gsutil web set -m index.html -e index.html "gs://$BUCKET_NAME"
    gsutil iam ch allUsers:objectViewer "gs://$BUCKET_NAME"
    Write-Host "✅ Configured bucket for static website hosting" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to configure bucket: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Google Cloud infrastructure setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   Project ID: $PROJECT_ID" -ForegroundColor White
Write-Host "   Service Account Key: slo-view-cicd-key.json" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Add the following secrets to your GitHub repository:" -ForegroundColor White
Write-Host "      - GCP_PROJECT_ID: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "      - GCP_SA_KEY: (contents of slo-view-cicd-key.json)" -ForegroundColor Yellow
Write-Host "      - GCP_BUCKET_NAME: $BUCKET_NAME" -ForegroundColor Yellow
Write-Host ""
Write-Host "   2. Push your code to GitHub to trigger the CI/CD pipeline" -ForegroundColor White
Write-Host ""
Write-Host "   3. Monitor deployments in the Google Cloud Console:" -ForegroundColor White
Write-Host "      - Cloud Run: https://console.cloud.google.com/run" -ForegroundColor Yellow
Write-Host "      - Cloud Storage: https://console.cloud.google.com/storage" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Important: Keep the service account key file secure and never commit it to version control!" -ForegroundColor Red
Write-Host ""
Write-Host "🚀 To deploy the applications, run:" -ForegroundColor Cyan
Write-Host "   scripts\deploy-applications.bat" -ForegroundColor Yellow
Write-Host ""
