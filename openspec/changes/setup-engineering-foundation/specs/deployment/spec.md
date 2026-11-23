# Spec Delta

## Purpose

Defines how the application reaches the web: a preview for every pull request, production from `main`, publicly viewable without an account, and buildable without secrets, so every requirement can be demonstrated (BC-DEMO-01).

## ADDED Requirements

### Requirement: Preview deployment per pull request
Every pull request to `main` SHALL get its own deployed preview, built from the pull request's latest commit, with the preview URL linked from the pull request. A new commit SHALL produce a new preview. (TC-DEPLOY-01)

#### Scenario: Pull request gets a preview
- **WHEN** a pull request is opened against `main`
- **THEN** the pull request shows a deployment status with a preview URL once the build finishes, and that URL serves the app built from the pull request's head commit

#### Scenario: New commit updates the preview
- **GIVEN** a pull request with an existing preview
- **WHEN** a new commit is pushed to its branch
- **THEN** a new preview is built for that commit and linked from the pull request

#### Scenario: Broken build does not deploy
- **GIVEN** a pull request whose production build fails
- **WHEN** the deployment runs
- **THEN** the pull request shows a failed deployment status and no new preview URL is published for that commit

### Requirement: Production deployment from main
Every commit that lands on `main` SHALL be deployed to the stable production URL. A failed production build SHALL leave the previous production deployment serving. (TC-DEPLOY-01)

#### Scenario: Merge deploys to production
- **WHEN** a pull request is merged into `main`
- **THEN** the production URL serves the merged commit once its deployment finishes

#### Scenario: Failed production build keeps the last good version
- **GIVEN** a commit on `main` whose production build fails
- **WHEN** the deployment finishes with an error
- **THEN** the production URL still serves the previous successful deployment

### Requirement: Public access to deployments
Preview and production URLs SHALL be viewable by anyone with the link, without signing in to the hosting provider or any other account. (BC-DEMO-01)

#### Scenario: Preview opens without signing in
- **GIVEN** a preview URL from a pull request
- **WHEN** it is opened in a private browser window with no cookies
- **THEN** the application's home page loads, and no hosting-provider sign-in or access page appears

#### Scenario: Production opens without signing in
- **WHEN** the production URL is opened in a private browser window
- **THEN** the application's home page loads without any sign-in step

### Requirement: Deployments need no secrets
Building and running a deployment SHALL require no API keys, tokens or other secret environment variables. (NFR-COST-01)

#### Scenario: Fresh project builds without configuration
- **GIVEN** a hosting project with no environment variables defined
- **WHEN** a deployment is built from `main`
- **THEN** the build succeeds and the deployed home page loads
