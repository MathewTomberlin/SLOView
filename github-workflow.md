# GitHub Collaboration Workflow

## Repository Structure
As determined, we will use separate repositories for frontend and backend:

1. `slo-view-frontend` - React frontend application
2. `slo-view-backend` - Spring Boot API backend

## Branching Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch for ongoing development

### Feature Branches
- Feature branches should be named with the pattern: `feature/short-description`
- Example: `feature/map-drag-functionality`

### Release Branches
- Release branches should be named with the pattern: `release/vX.X.X`
- Example: `release/v1.0.0`

### Hotfix Branches
- Hotfix branches should be named with the pattern: `hotfix/short-description`
- Example: `hotfix/map-loading-issue`

## Pull Request Process

### PR Requirements
1. All feature development must be done in feature branches
2. Pull requests must be created from feature branch to `develop`
3. Pull requests must be reviewed by at least one other developer
4. All CI checks must pass before merging
5. PR description must include:
   - Summary of changes
   - Related issue numbers (if applicable)
   - Testing instructions

### PR Merge Process
1. Reviewer approves the PR
2. All CI checks pass
3. PR is merged to `develop` using "Squash and merge"
4. Feature branch is deleted after merge

## Issue Tracking

### Issue Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority-high` - High priority issue
- `priority-medium` - Medium priority issue
- `priority-low` - Low priority issue

### Issue Templates
Both repositories will include issue templates for:
1. Bug reports
2. Feature requests
3. Documentation improvements

## Code Review Guidelines

### Review Checklist
1. Code follows project style guidelines
2. Code is well-documented
3. Tests are included for new functionality
4. No security vulnerabilities introduced
5. Performance considerations addressed
6. Code is readable and maintainable

### Review Process
1. Reviewer assigned within 24 hours of PR creation
2. Review feedback provided within 48 hours
3. Author addresses feedback within 72 hours
4. Final approval and merge

## CI/CD Pipeline

### Frontend Repository
1. Code linting with ESLint
2. Unit tests with Jest
3. Build process validation
4. Deployment to staging environment on `develop` branch
5. Deployment to production environment on `main` branch

### Backend Repository
1. Code compilation check
2. Unit tests with JUnit
3. Integration tests
4. Docker image build
5. Deployment to staging environment on `develop` branch
6. Deployment to production environment on `main` branch

## Development Setup

### Frontend
1. Clone repository
2. Run `npm install`
3. Run `npm start` for local development
4. Run `npm test` to execute tests

### Backend
1. Clone repository
2. Run `mvn clean install`
3. Run `mvn spring-boot:run` for local development
4. Run `mvn test` to execute tests

## Documentation Standards

### README Files
Each repository will have a comprehensive README including:
1. Project description
2. Installation instructions
3. Usage examples
4. Development setup
5. Testing instructions
6. Deployment process
7. Contributing guidelines
8. License information

### Code Documentation
1. All public methods and classes must be documented
2. Complex logic should include inline comments
3. TODO comments should reference issue numbers when applicable

## Communication Guidelines

### Commit Messages
Follow conventional commit format:
- `feat: ` for new features
- `fix: ` for bug fixes
- `docs: ` for documentation changes
- `style: ` for formatting changes
- `refactor: ` for code refactoring
- `test: ` for adding tests
- `chore: ` for maintenance tasks

Example: `feat: add map drag functionality`

### Pull Request Descriptions
1. Clear title summarizing changes
2. Detailed description of what changed and why
3. Screenshots or GIFs for UI changes (when applicable)
4. Steps to test the changes
5. Related issues or PRs

## Release Process

### Versioning
Follow Semantic Versioning (SemVer):
- MAJOR version for incompatible API changes
- MINOR version for backward-compatible functionality
- PATCH version for backward-compatible bug fixes

### Release Steps
1. Create release branch from `develop`
2. Update version numbers
3. Update CHANGELOG.md
4. Create PR from release branch to `main`
5. After merge, create GitHub release
6. Merge `main` back to `develop`

## Security Practices

### Code Security
1. No secrets in code (use environment variables)
2. Regular dependency vulnerability scanning
3. Code scanning for security issues

### Access Control
1. Two-factor authentication required for all contributors
2. Principle of least privilege for repository access
3. Regular access review

## Onboarding New Developers

### Initial Setup
1. Repository access invitation
2. Development environment setup guide
3. Introduction to branching and PR process
4. Code review guidelines
5. Communication channels information

### First Contribution
1. Assign a "good first issue"
2. Pair programming session (optional)
3. Code review with detailed feedback
4. Welcome to the team!