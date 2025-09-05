@echo off
REM SLO View - Application Deployment Script (Windows)
REM This script deploys both frontend and backend applications to Google Cloud

setlocal enabledelayedexpansion

REM Configuration variables
set PROJECT_ID=slo-view-app
set REGION=us-west1
set BUCKET_NAME=slo-view-frontend
set BACKEND_SERVICE_NAME=slo-view-backend

echo 🚀 Deploying SLO View applications to Google Cloud...

REM Deploy backend
echo.
echo 📦 Deploying backend application...
cd slo-view-backend

REM Build the application
echo 🔨 Building backend application...
call mvn clean package -DskipTests
if errorlevel 1 (
    echo ❌ Backend build failed
    exit /b 1
)

REM Build Docker image
echo 🐳 Building Docker image...
docker build -t gcr.io/%PROJECT_ID%/%BACKEND_SERVICE_NAME% .
if errorlevel 1 (
    echo ❌ Docker build failed
    exit /b 1
)

REM Push to Container Registry
echo 📤 Pushing Docker image to Container Registry...
docker push gcr.io/%PROJECT_ID%/%BACKEND_SERVICE_NAME%
if errorlevel 1 (
    echo ❌ Docker push failed
    exit /b 1
)

REM Deploy to Cloud Run
echo 🚀 Deploying to Cloud Run...
gcloud run deploy %BACKEND_SERVICE_NAME% --image gcr.io/%PROJECT_ID%/%BACKEND_SERVICE_NAME% --platform managed --region %REGION% --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --max-instances 10 --set-env-vars ENVIRONMENT=production
if errorlevel 1 (
    echo ❌ Cloud Run deployment failed
    exit /b 1
)

REM Get the service URL
for /f "tokens=*" %%i in ('gcloud run services describe %BACKEND_SERVICE_NAME% --platform managed --region %REGION% --format "value(status.url)"') do set SERVICE_URL=%%i

echo ✅ Backend deployed to: %SERVICE_URL%

REM Test the health endpoint
echo 🔍 Testing backend health endpoint...
curl -f %SERVICE_URL%/health
if errorlevel 1 (
    echo ❌ Backend health check failed
    exit /b 1
) else (
    echo ✅ Backend health check passed
)

cd ..

REM Deploy frontend
echo.
echo 🌐 Deploying frontend application...
cd slo-view-frontend

REM Build the application
echo 🔨 Building frontend application...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    exit /b 1
)

REM Deploy to Cloud Storage
echo 📤 Deploying to Cloud Storage...
gsutil -m rsync -r -d build/ gs://%BUCKET_NAME%/
if errorlevel 1 (
    echo ❌ Frontend deployment failed
    exit /b 1
)

REM Get the website URL
set WEBSITE_URL=https://storage.googleapis.com/%BUCKET_NAME%/index.html
echo ✅ Frontend deployed to: %WEBSITE_URL%

REM Test the website
echo 🔍 Testing frontend deployment...
curl -f -I %WEBSITE_URL%
if errorlevel 1 (
    echo ❌ Frontend deployment test failed
    exit /b 1
) else (
    echo ✅ Frontend deployment test passed
)

cd ..

echo.
echo 🎉 All applications deployed successfully!
echo.
echo 📋 Deployment Summary:
echo    Backend URL: %SERVICE_URL%
echo    Frontend URL: %WEBSITE_URL%
echo.
echo 🔧 You can now:
echo    1. Visit the frontend at: %WEBSITE_URL%
echo    2. Test the backend API at: %SERVICE_URL%/health
echo    3. Monitor deployments in Google Cloud Console
echo.
pause
