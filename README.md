# Monorepo Project for AI-Driven Personalized Newsletters

## Table of Contents

1. [Overview](#overview)
2. [Backend](#backend)
   - [Database Schema](#database-schema)
     - [Database Schema Relationships](#database-schema-relationships)
   - [Core Functionalities](#core-functionalities)
   - [Server Architecture](#server-architecture)
     - [Entry Point](#entry-point)
     - [Controllers](#controllers)
     - [Routes](#routes)
     - [Middleware](#middleware)
   - [API Endpoints](#api-endpoints)
   - [AI Integration](#ai-integration)
3. [Frontend](#frontend)
   - [Dependencies](#dependencies)
   - [Core Functionalities](#core-functionalities-1)
   - [UI Components](#ui-components)
4. [Environment Variables](#environment-variables)
5. [External Services](#external-services)

---

## Overview

This monorepo project aims to generate personalized newsletters through AI algorithms. It consists of frontend and backend subsystems. The backend is built in a Node.js environment and utilizes Prisma for Object-Relational Mapping (ORM). The frontend is developed using React and incorporates Auth0 for secure authentication.

---

## Backend

### Database Schema

#### Database Schema Relationships

This section details the relationships and constraints among the database models—Admin, Newsletter, UsedArticle, and ContentHistory.

#### Models and Fields

1. **Admin**

   - `id`: UUID-based unique identifier.
   - `email`: Unique email.
   - `name`: Optional name.
   - `newsletters`: Array of authored newsletters.
   - `mailingList`: Array of strings (email addresses) to send newsletters.

2. **Newsletter**

   - `id`: Auto-incremented unique identifier.
   - `regenerateCount`: Regeneration attempts counter.
   - `title`, `content`, `sentDate`, `adminID`, `topic`, `reason`, `searchQuery`: Various attributes.
   - `contentHistory`: Array of historical contents.
   - `usedArticles`: Array of used articles.
   - `admin`: Foreign key to `Admin`.

3. **UsedArticle**

   - `id`: Auto-incremented unique identifier.
   - `url`, `newsletterId`, `createdAt`, `adminID`, `topic`, `reason`: Various attributes.
   - `summary`: Relation to `ArticleSummary`.
   - `summaryID`: Foreign key to `ArticleSummary`.
   - `newsletter`: Foreign key to `Newsletter`.

4. **ContentHistory**

   - `id`: Auto-incremented unique identifier.
   - `newsletterId`, `content`, `createdAt`: Various attributes.
   - `newsletter`: Foreign key to `Newsletter`.

5. **ArticleSummary**
   - `id`: UUID-based unique identifier.
   - `url: Unique URL.
   - `summary`: Summary text.
   - `usedBy`: Array of `UsedArticle` that used this summary.

#### Relationships

1. **Admin -> Newsletter**: One-to-Many
2. **Newsletter -> ContentHistory**: One-to-Many
3. **Newsletter -> UsedArticle**: One-to-Many
4. **UsedArticle -> ArticleSummary**: One-to-One
5. **ArticleSummary -> UsedArticle**: One-to-Many

#### Constraints

1. **Cascade Delete**: Enabled with `onDelete: Cascade`.
2. **Field Defaults**: Specified using Prisma directives.
3. **Uniqueness and IDs**: Ensured through unique fields.

> For further reading, consider Prisma's [Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations) and PostgreSQL's [Referential Integrity](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK).

### Core Functionalities

#### Prisma Client (`prismaClient.ts`)

- `importEmailList`: Bulk email import.
- `addSingleEmail`: Singular email addition.

#### Data Processing (`dataprocessing.ts`)

- `isArticleUsed`: Article reuse validation.
- `processArticles`: Article filtering.
- `sortArticles`: Article ranking.

### Server Architecture

The server-side logic is modularized into an MVC-like architecture comprising routes, controllers, and utility functions. The entry point of the backend is `index.ts`.

#### Entry Point (`index.ts`)

Acts as the backend entry point, orchestrating the routes, controllers, and middleware configurations. Initializes the Express.js server, and sets it to listen on a specified port or default to 3001.

#### Controllers

Located in the `src/controllers` directory. Responsible for handling business logic, they interact with the database and return responses.

- `adminController.ts`: Handles admin-related functionalities.
- `newsletterController.ts`: Manages newsletter generation and sending.

#### Routes

Located in the `src/routes` directory. Define the API endpoints and associate them with their corresponding controllers.

- `adminRoutes.ts`: Routes related to admin functionalities.
- `newsletterRoutes.ts`: Routes for newsletter operations.

#### Middleware

Middleware configurations are located in the `server/config/middleware.ts` file.

- `express.json()`: For JSON parsing.
- `cors`: For CORS handling.

Middleware is initialized and configured in the `index.ts` entry point.

### API Endpoints

- `GET /unsubscribe`
- `POST /api/update-admin`
- `POST /api/create-newsletter`
- `GET /api/get-newsletters`
- `GET /api/get-emails`
- `POST /api/delete-selected-emails`
- `DELETE /api/delete-newsletter/:id`
- `POST /api/add-emails`
- `POST /api/send-newsletter`
- `POST /api/regenerate-newsletter`

### AI Integration

- `generateOptimalBingSearchQuery`
- `generateSummaryWithGPT`
- `generateNewsletterWithGPT`

---

## Frontend

### Dependencies

- React, Auth0, Emotion, Material-UI

### Core Functionalities

#### App Component (`app.jsx`)

- Authentication and routing.

#### API Service (`apiservice.js`)

- Backend API utilities.

#### Authenticated App (`authenticatedapp`)

- Authenticated segment management.

### UI Components

- `ConfirmDeleteDialog`
- `ConfirmSendDialog`
- `EmailList`
- `LoginButton`
- `LogoutButton`
- `NewsletterDetailDialog`
- `NewsletterForm`
- `NewsletterList`

---

## Environment Variables (`auth0-config.json`)

- Auth0 authentication configurations.

## External Services

- Bing Search API
- AWS SES

## Environment Variables

- `DATABASE_URL`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `BING_API_KEY`
- `GPT_API_KEY`
