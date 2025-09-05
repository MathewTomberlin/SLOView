# SLO View - Architecture Planning

This repository contains the architecture planning documents for the SLO View application, which consists of a React frontend and Spring API backend.

## Project Overview

The SLO View application will feature:
- A React frontend hosted in Google Cloud Storage
- A Spring API backend hosted in Google Cloud Run
- A navigation bar with the site title "SLO View"
- A San Luis Obispo county map viewer with drag and zoom functionality

## Architecture Documents

1. [Architecture Design](architecture.md) - High-level architecture diagram and component overview
2. [Technical Specifications](technical-specs.md) - Detailed technical requirements and specifications
3. [GitHub Workflow](github-workflow.md) - Collaboration process and development workflow
4. [Deployment Strategy](deployment-strategy.md) - Deployment processes for Google Cloud Storage and Cloud Run

## Repository Structure

This project will use separate repositories:
- `slo-view-frontend` - React frontend application
- `slo-view-backend` - Spring Boot API backend

## Next Steps

The following items are still being evaluated:
- Map implementation approach for San Luis Obispo county

## Implementation Plan

Once all planning documents are finalized, the implementation will proceed in the following order:
1. Backend API development (minimal health check endpoint)
2. Frontend development (navigation bar and map viewer)
3. Integration and testing
4. Deployment to Google Cloud

## Contributing

Please refer to the [GitHub Workflow](github-workflow.md) document for contribution guidelines.