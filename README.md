# Monorepo Project for AI-Driven Personalized Newsletters

## Table of Contents

1. [Overview](#overview)
2. [Backend](#backend)
   - [Database Schema](#database-schema)
   - [Core Functionalities](#core-functionalities)
   - [Server Implementation](#server-implementation)
   - [API Endpoints](#api-endpoints)
   - [AI Integration](#ai-integration)
3. [Frontend](#frontend)
   - [Dependencies](#dependencies)
   - [Core Functionalities](#core-functionalities-1)
   - [UI Components](#ui-components)
4. [Environment Variables](#environment-variables)
5. [External Services](#external-services)

## Overview

This monorepo project is designed to generate personalized newsletters through AI algorithms. It is composed of frontend and backend subsystems. The backend is architected in a Node.js environment and leverages Prisma for Object-Relational Mapping (ORM). The frontend is constructed using React and integrates Auth0 for secure authentication.

---

## Backend

### Database Schema

#### Prisma Schema (`schema.prisma`)

- `User`: Models the user entity with attributes such as `id`, `userEmail`, `name`, `newsletters`, and `emailsToSendTo`.
- `Newsletter`: Encapsulates metadata about individual newsletters.
- `UsedArticle`: Maintains a record of articles that have been utilized in newsletters.

### Core Functionalities

#### Prisma Client (`prismaClient.ts`)

- `importEmailList`: Bulk imports email addresses for a designated user.
- `addSingleEmail`: Appends a singular email to a user's email list.

#### Data Processing (`dataprocessing.ts`)

- `isArticleUsed`: Validates whether an article has been previously used.
- `processArticles`: Filters articles based on a given search query.
- `sortArticles`: Ranks articles according to their relevance and rationale.

### Server Implementation (`server.ts`)

The server is implemented using Express.js and is configured to run on a port specified in the environment variables or defaults to 3001. It uses Prisma as the ORM and AWS SES for email services.

#### Middleware

- `express.json()`: For parsing JSON request bodies.
- `cors`: For handling CORS issues.

#### Server Initialization

The server is initialized to listen on the specified port and logs a message to the console confirming the same.

### API Endpoints

The server exposes several RESTful API endpoints for various functionalities:

- `GET /unsubscribe`: Handles unsubscription requests.
- `POST /api/update-user`: Updates user information.
- `POST /api/create-newsletter`: Creates a new newsletter.
- `GET /api/get-newsletters`: Fetches all newsletters for a user.
- `GET /api/get-emails`: Fetches all emails for a user.
- `POST /api/delete-selected-emails`: Deletes selected emails.
- `DELETE /api/delete-newsletter/:id`: Deletes a newsletter by ID.
- `POST /api/add-emails`: Adds emails to a user's list.
- `POST /api/send-newsletter`: Sends the newsletter.
- `POST /api/regenerate-newsletter`: Regenerates the content of a newsletter.

### AI Integration

- `generateOptimalBingSearchQuery`: Constructs an optimized Bing search query.
- `generateSummaryWithGPT`: Summarizes articles using GPT algorithms.
- `generateNewsletterWithGPT`: Fabricates the newsletter content via GPT.

---

## Frontend

### Dependencies (`package.json`)

- Libraries: React, Auth0, Emotion (Styling), Material-UI (UI Components)

### Core Functionalities

#### App Component (`app.jsx`)

- Manages authentication and routes users to the pertinent component.

#### API Service (`apiservice.js`)

- Offers utility functions for backend API communication.

#### Authenticated App (`authenticatedapp`)

- Oversees the authenticated segment of the application.

### UI Components

- `ConfirmDeleteDialog`: Confirmation dialog for delete operations.
- `ConfirmSendDialog`: Confirmation dialog for send operations.
- `EmailList`: Manages and displays the email list.
- `LoginButton`: Executes user login.
- `LogoutButton`: Executes user logout.
- `NewsletterDetailDialog`: Shows detailed newsletter information.
- `NewsletterForm`: Provides a form interface for newsletter creation.
- `NewsletterList`: Manages and displays the list of newsletters.

---

## Environment Variables (`auth0-config.json`)

- Auth0 configurations for authentication are stored here.

## External Services

- **Bing Search API**: Responsible for article retrieval based on search queries.
- **AWS SES**: Utilized for email dispatch.

## Environment Variables

- `DATABASE_URL`: URL for the PostgreSQL database.
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS SES settings.
- `BING_API_KEY`: API key for Bing Search.
- `GPT_API_KEY`: API key for GPT.
