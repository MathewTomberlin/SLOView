# SLO View - Deployment Scripts

This directory contains automated deployment and setup scripts for the SLO View application.

## Scripts Overview

### Setup Scripts
- **`setup-gcp-infrastructure.bat`** - Windows script to set up Google Cloud infrastructure
- **`setup-gcp-infrastructure.sh`** - Linux/Mac script to set up Google Cloud infrastructure

### Deployment Scripts
- **`deploy-applications.bat`** - Windows script to deploy both frontend and backend applications
- **`verify-deployment.bat`** - Windows script to verify successful deployment

## Usage

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
# Make script executable
chmod +x scripts/setup-gcp-infrastructure.sh

# Set up Google Cloud infrastructure
./scripts/setup-gcp-infrastructure.sh
```

## Prerequisites

Before running these scripts, ensure you have:
- Google Cloud SDK installed and authenticated
- Docker Desktop running
- Node.js and Maven installed
- Proper permissions for Google Cloud resources

## Notes

- These scripts automate the manual setup process described in [SETUP_INSTRUCTIONS.md](../SETUP_INSTRUCTIONS.md)
- For detailed manual setup instructions, refer to the main documentation
- Scripts include error checking and will stop execution if prerequisites are not met
