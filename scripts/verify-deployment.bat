@echo off
REM SLO View - Deployment Verification Script
REM This script verifies that both frontend and backend are deployed correctly

setlocal enabledelayedexpansion

set PROJECT_ID=slo-view-app
set REGION=us-west1
set BUCKET_NAME=slo-view-frontend
set BACKEND_SERVICE_NAME=slo-view-backend

echo 🔍 Verifying SLO View deployment...

REM Get backend service URL
echo 📡 Getting backend service URL...
for /f "tokens=*" %%i in ('gcloud run services describe %BACKEND_SERVICE_NAME% --platform managed --region %REGION% --format "value(status.url)"') do set SERVICE_URL=%%i

if "%SERVICE_URL%"=="" (
    echo ❌ Could not get backend service URL. Is the service deployed?
    exit /b 1
)

echo ✅ Backend service URL: %SERVICE_URL%

REM Test backend health endpoint
echo 🔍 Testing backend health endpoint...
curl -s -f %SERVICE_URL%/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend health check failed
    echo    URL: %SERVICE_URL%/health
    exit /b 1
) else (
    echo ✅ Backend health check passed
)

REM Test frontend deployment
echo 🌐 Testing frontend deployment...
set WEBSITE_URL=https://storage.googleapis.com/%BUCKET_NAME%/index.html
curl -s -f -I %WEBSITE_URL% >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend deployment test failed
    echo    URL: %WEBSITE_URL%
    exit /b 1
) else (
    echo ✅ Frontend deployment test passed
)

echo.
echo 🎉 Deployment verification completed successfully!
echo.
echo 📋 Application URLs:
echo    Backend API: %SERVICE_URL%
echo    Frontend: %WEBSITE_URL%
echo.
echo 🔧 You can now:
echo    1. Visit the frontend at: %WEBSITE_URL%
echo    2. Test the backend API at: %SERVICE_URL%/health
echo    3. View the interactive map and navigation
echo.
pause
