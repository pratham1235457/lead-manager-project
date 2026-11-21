# Lead Manager

Lead Manager is a full-stack CRM-style application for organizing sales leads and tracking their progress. It provides account-based authentication, lead CRUD operations, status management, search, sorting, filtering, pagination, and summary counts.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Commands](#available-commands)
- [API Overview](#api-overview)
- [Security and Data Behavior](#security-and-data-behavior)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features

- Register and sign in with a name, email, and password
- Use a preconfigured demo account and sample leads
- Create, edit, delete, and quickly update lead statuses
- Search leads by name, email, or company
- Filter by `New`, `Contacted`, `Qualified`, or `Lost`
- Sort by newest, oldest, or name
- Navigate paginated lead results
- View total and status-based lead counts
- Keep leads private to the authenticated account

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcrypt password hashing |
| Validation | express-validator |
| Security middleware | Helmet, CORS, express-rate-limit |
| Testing | Node.js test runner, Supertest |

## Project Structure

```text
lead-manager/
├── backend/
│   ├── middleware/       # Authentication and centralized error handling
│   ├── models/           # Mongoose User and Lead models
│   ├── routes/           # Authentication and lead endpoints
│   ├── tests/            # Backend API tests
│   ├── .env.example
│   └── server.js         # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── api/          # Browser API client
│   │   ├── components/   # Reusable UI components
│   │   └── App.jsx       # Main application interface
│   ├── .env.example
│   └── package.json
└── package.json          # Root development and build commands
```

## Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB Atlas connection string
- Windows PowerShell or a compatible terminal

## Getting Started

1. Clone the repository and open the project directory:

   ```powershell
   git clone <repository-url>
   cd lead-manager
   ```

2. Install root, backend, and frontend dependencies:

   ```powershell
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

3. Create the environment files:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

4. Configure `backend/.env` with your MongoDB connection and a strong JWT secret. See [Environment Variables](#environment-variables).

5. Start MongoDB if you are using a local database.

6. Start both development servers:

   ```powershell
   npm run dev
   ```

The application will be available at:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API health check: `http://localhost:5000/api/health`

For a quick evaluation, open the frontend and select **Demo login**.

## Environment Variables

### Backend: `backend/.env`

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Express server port |
| `MONGODB_URI` | No | `mongodb://127.0.0.1:27017/lead_manager` | MongoDB connection URI |
| `JWT_SECRET` | Yes | None | Long, unpredictable secret used to sign 7-day access tokens |
| `CLIENT_URL` | No | `*` | Allowed frontend origin for CORS |

Example local configuration:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lead_manager
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Generate a local secret with PowerShell:

```powershell
[Convert]::ToHexString((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Frontend: `frontend/.env`

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | No | `http://localhost:5000/api` | Base URL used for API requests |

Example:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Restart the Vite development server after changing frontend environment variables.

## Available Commands

Run commands from the repository root unless noted otherwise.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start backend and frontend development servers concurrently |
| `npm start` | Start the backend with Node.js |
| `npm run build` | Create the frontend production bundle in `frontend/dist` |
| `npm test` | Run backend tests |
| `npm --prefix backend run dev` | Start only the backend in Node watch mode |
| `npm --prefix backend start` | Start only the backend |
| `npm --prefix frontend run dev` | Start only the Vite frontend |
| `npm --prefix frontend run build` | Build only the frontend |
| `npm --prefix frontend run preview` | Preview the built frontend locally |

## API Overview

All lead routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Report API status |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in and receive a JWT |
| `POST` | `/api/auth/demo` | Sign in to or create the demo account |
| `GET` | `/api/leads` | Search, filter, sort, count, and paginate leads |
| `POST` | `/api/leads` | Create a lead |
| `PUT` | `/api/leads/:id` | Replace an existing lead |
| `PATCH` | `/api/leads/:id/status` | Update only a lead status |
| `DELETE` | `/api/leads/:id` | Delete a lead |

The lead list endpoint accepts these query parameters:

- `search`: searches name, email, and company
- `status`: `New`, `Contacted`, `Qualified`, or `Lost`
- `sort`: `newest`, `oldest`, `name_asc`, or `name_desc`
- `page`: one-based page number
- `limit`: page size from 1 to 100

Lead sources are `Website`, `Referral`, `LinkedIn`, `Cold Outreach`, `Event`, and `Other`.

Example:

```powershell
curl "http://localhost:5000/api/leads?search=cloud&status=New&sort=newest&page=1&limit=10" `
  -H "Authorization: Bearer <token>"
```

## Security and Data Behavior

- Passwords are hashed with bcrypt before being stored.
- JWTs expire after seven days.
- Lead records are scoped to the authenticated user.
- Authentication routes are rate-limited to 30 requests per 15-minute window.
- Request bodies are limited to 100 KB.
- Helmet, CORS, centralized error handling, and input validation are enabled.
- Authentication tokens and the current user are stored in browser `localStorage`.
- Do not reuse a development JWT secret or credentials in a deployed environment.

## Testing

Run the backend test suite:

```powershell
npm test
```

The tests cover the health endpoint, unauthenticated lead access, lead validation, and malformed MongoDB IDs.

Make sure `JWT_SECRET` is set in `backend/.env` before running the suite.

## Troubleshooting

### MongoDB connection fails

- Confirm MongoDB is running.
- Verify `MONGODB_URI` in `backend/.env`.
- Check that a MongoDB Atlas URI includes valid credentials and network access if using Atlas.

### Backend refuses to start

- Confirm `JWT_SECRET` is configured.
- Confirm port `5000` is not already in use.
- Run `npm --prefix backend start` to see the backend process output directly.

### Frontend cannot reach the API

- Confirm the backend is running at `http://localhost:5000`.
- Verify `VITE_API_URL` in `frontend/.env`.
- Restart Vite after environment-file changes.
- Check `CLIENT_URL` if CORS errors appear in the browser console.

### Session token returns 401

- Sign in again to obtain a new token.
- A token becomes invalid if it expires or `JWT_SECRET` changes.