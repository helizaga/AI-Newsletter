# Monorepo Project for AI-Driven Personalized Newsletters

## Table of Contents

1. [Overview](#overview)
2. [Backend](#backend)
   - [Database Schema](#database-schema)
     - [Database Schema Relationships](#database-schema-relationships)
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
   - `mailingList`: JSON field for additional email addresses.

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
   - `newsletter`: Foreign key to `Newsletter`.

4. **ContentHistory**
   - `id`: Auto-incremented unique identifier.
   - `newsletterId`, `content`, `createdAt`: Various attributes.
   - `newsletter`: Foreign key to `Newsletter`.

#### Relationships

1. **Admin -> Newsletter**: One-to-Many
2. **Newsletter -> ContentHistory**: One-to-Many
3. **Newsletter -> UsedArticle**: One-to-Many
4. **Composite Uniqueness in UsedArticle**: Defined by `@@unique` directive.

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

### Server Implementation (`server.ts`)

Built with Express.js, configured to run on a specified port or default to 3001. Utilizes Prisma as ORM and AWS SES for email services.

#### Middleware

- `express.json()`: JSON parsing.
- `cors`: CORS handling.

#### Server Initialization

Logs a confirmation message upon successful initialization.

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
