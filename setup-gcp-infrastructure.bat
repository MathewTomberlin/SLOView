@echo off
REM SLO View - Google Cloud Infrastructure Setup Script (Windows)
REM This script sets up the complete Google Cloud infrastructure for the SLO View application

setlocal enabledelayedexpansion

REM Configuration variables
set PROJECT_ID=slo-view-app
set PROJECT_NAME=SLO View Application
set REGION=us-central1
set SERVICE_ACCOUNT_NAME=slo-view-cicd
set BUCKET_NAME=slo-view-frontend
set BACKEND_SERVICE_NAME=slo-view-backend

echo 🚀 Setting up Google Cloud infrastructure for SLO View...

REM Check if gcloud is installed
gcloud --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Google Cloud SDK is not installed. Please install it first:
    echo    https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM Check if user is authenticated
gcloud auth list --filter=status:ACTIVE --format="value(account)" | findstr /r "." >nul 2>&1
if errorlevel 1 (
    echo ❌ Not authenticated with Google Cloud. Please run:
    echo    gcloud auth login
    exit /b 1
)

echo ✅ Google Cloud SDK is installed and authenticated

REM Create project (if it doesn't exist)
echo 📋 Creating Google Cloud project...
gcloud projects describe %PROJECT_ID% >nul 2>&1
if errorlevel 1 (
    gcloud projects create %PROJECT_ID% --name="%PROJECT_NAME%"
    echo ✅ Created project %PROJECT_ID%
) else (
    echo ✅ Project %PROJECT_ID% already exists
)

REM Set the project as default
gcloud config set project %PROJECT_ID%
echo ✅ Set %PROJECT_ID% as default project

REM Enable required APIs
echo 🔧 Enabling required APIs...
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
echo ✅ Enabled required APIs

REM Create service account for CI/CD
echo 👤 Creating service account for CI/CD...
gcloud iam service-accounts describe %SERVICE_ACCOUNT_NAME%@%PROJECT_ID%.iam.gserviceaccount.com >nul 2>&1
if errorlevel 1 (
    gcloud iam service-accounts create %SERVICE_ACCOUNT_NAME% --description="Service account for SLO View CI/CD" --display-name="SLO View CI/CD"
    echo ✅ Created service account %SERVICE_ACCOUNT_NAME%
) else (
    echo ✅ Service account %SERVICE_ACCOUNT_NAME% already exists
)

REM Grant necessary permissions to service account
echo 🔐 Granting permissions to service account...
gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:%SERVICE_ACCOUNT_NAME%@%PROJECT_ID%.iam.gserviceaccount.com" --role="roles/run.admin"
gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:%SERVICE_ACCOUNT_NAME%@%PROJECT_ID%.iam.gserviceaccount.com" --role="roles/storage.admin"
gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:%SERVICE_ACCOUNT_NAME%@%PROJECT_ID%.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:%SERVICE_ACCOUNT_NAME%@%PROJECT_ID%.iam.gserviceaccount.com" --role="roles/cloudbuild.builds.builder"
echo ✅ Granted permissions to service account

REM Create and download service account key
echo 🔑 Creating service account key...
if not exist "slo-view-cicd-key.json" (
    gcloud iam service-accounts keys create slo-view-cicd-key.json --iam-account=%SERVICE_ACCOUNT_NAME%@%PROJECT_ID%.iam.gserviceaccount.com
    echo ✅ Created service account key: slo-view-cicd-key.json
) else (
    echo ✅ Service account key already exists: slo-view-cicd-key.json
)

REM Create Cloud Storage bucket for frontend
echo 🪣 Creating Cloud Storage bucket for frontend...
gsutil ls -b gs://%BUCKET_NAME% >nul 2>&1
if errorlevel 1 (
    gsutil mb gs://%BUCKET_NAME%
    echo ✅ Created bucket gs://%BUCKET_NAME%
) else (
    echo ✅ Bucket gs://%BUCKET_NAME% already exists
)

REM Configure bucket for static website hosting
echo 🌐 Configuring bucket for static website hosting...
gsutil web set -m index.html -e index.html gs://%BUCKET_NAME%
gsutil iam ch allUsers:objectViewer gs://%BUCKET_NAME%
echo ✅ Configured bucket for static website hosting

echo.
echo 🎉 Google Cloud infrastructure setup completed successfully!
echo.
echo 📋 Summary:
echo    Project ID: %PROJECT_ID%
echo    Service Account Key: slo-view-cicd-key.json
echo.
echo 🔧 Next steps:
echo    1. Add the following secrets to your GitHub repository:
echo       - GCP_PROJECT_ID: %PROJECT_ID%
echo       - GCP_SA_KEY: (contents of slo-view-cicd-key.json)
echo       - GCP_BUCKET_NAME: %BUCKET_NAME%
echo.
echo    2. Push your code to GitHub to trigger the CI/CD pipeline
echo.
echo    3. Monitor deployments in the Google Cloud Console:
echo       - Cloud Run: https://console.cloud.google.com/run
echo       - Cloud Storage: https://console.cloud.google.com/storage
echo.
echo ⚠️  Important: Keep the service account key file secure and never commit it to version control!
echo.
echo 🚀 To deploy the applications, run:
echo    deploy-applications.bat
echo.
pause
