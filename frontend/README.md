# Debate Agents Frontend

A Next.js App Router frontend for running and visualizing AI debates in real time.

## Table of Contents

- Overview
- Key Features
- Tech Stack
- Project Structure
- Prerequisites
- Environment Variables
- Quick Start (Docker Recommended)
- Local Development (Without Docker)
- Production Runbook
- Docker Service Reference
- Application Routes
- API and Event Contract
- Available Scripts
- Troubleshooting
- Security Notes
- Contributing
- License

## Overview

This application provides a debate arena UI where users:

- Select debaters and a topic
- Start a debate session against the backend API
- Stream debate events over Server-Sent Events (SSE)
- View round-by-round debate flow, confidence, and judging outcomes
- Review analytics (usage, tokens, cost, duration)

The frontend is designed to work with a separate backend service and is configured via environment variables.

## Key Features

- Next.js App Router architecture
- Real-time streaming via SSE
- XState-powered debate flow machine
- Analytics dashboard (`/analytics`)
- Session-based user identity and session continuity in browser storage
- Dockerized development and production workflows

## Tech Stack

- Framework: Next.js 16, React 19, TypeScript
- Styling: Tailwind CSS v4, Radix UI primitives
- State and orchestration: XState
- Motion: Framer Motion
- Runtime: Node.js + npm
- Containerization: Docker + Docker Compose

## Project Structure

```text
app/                    # App Router pages and UI composition
actions/                # API client actions (REST URL construction and fetches)
hooks/                  # Feature hooks and debate engine orchestration
lib/                    # Utilities (SSE helpers, session helpers)
contexts/               # React context providers (auth/session)
constants/              # Debater/topic constants
types/                  # Shared TypeScript domain types
public/                 # Static assets
Dockerfile              # Multi-stage image for dev/build/run
../docker-compose.yml   # Root compose orchestrating full stack
../docker-compose.prod.yml # Root compose for production stack
```

## Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- Optional for non-Docker workflow: Node.js 22+ and npm

## Environment Variables

Create `.env.local` from the example template:

```bash
cp .env.example .env.local
```

Windows PowerShell equivalent:

```powershell
Copy-Item .env.example .env.local
```

Required variables:

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_DEBATE_API_BASE_URL` | Yes | `http://localhost:8000` | Base URL for the backend API consumed by the browser and build-time client bundle |

Notes:

- This variable is public (`NEXT_PUBLIC_*`) and exposed to client-side code by design.
- The app throws an explicit runtime error if it is missing.

## Quick Start (Docker Recommended)

### 1. Set environment values

```bash
cp .env.example .env.local
```

Update `.env.local` with the correct backend URL.

### 2. Run in development mode (hot reload)

```bash
docker compose up --build
```

Run this from the repository root. It starts the full stack and runs `next dev` with source mounted into the container.

App URL: `http://localhost:3000`

### 3. Stop

```bash
docker compose down
```

To remove named volumes too:

```bash
docker compose down -v
```

## Local Development (Without Docker)

```bash
npm ci
npm run dev
```

App URL: `http://localhost:3000`

## Production Runbook

Run production flow with the root production compose file:

```bash
docker compose -f docker-compose.prod.yml up --build
```

This uses the production image path:

- `next build` during image build
- `next start` at runtime

## Docker Service Reference

Defined in the root `docker-compose.yml` (dev) and `docker-compose.prod.yml` (prod):

- `frontend`:
  - Default service for local development
  - Mounts source code into `/app`
  - Runs `next dev` with hot reload
  - Exposes `3000:3000`
- Production uses the same service name via `docker-compose.prod.yml`

## Application Routes

- `/` - Debate setup and selection flow
- `/debate/[debate_id]` - Live debate arena
- `/analytics` - Debate analytics and history

## API and Event Contract

Frontend integration points (see `actions/debate-api.ts`):

- `POST /debate`
- `GET /debate/{debate_id}/events?session_id=...&user_id=...` (SSE)
- `GET /debates?session_id=...&user_id=...`
- `GET /debates/analytics?session_id=...&user_id=...`
- `GET /debates/overview?session_id=...&user_id=...`

Backend expectations:

- Backend must be reachable from the browser at `NEXT_PUBLIC_DEBATE_API_BASE_URL`.
- Backend must support CORS for the frontend origin.
- SSE endpoint should remain open and stream JSON payloads with supported event types.

Common SSE event types consumed by the UI:

- `message`
- `update`
- `agent_response`
- `data`
- `agent_done`
- `presenter_intro_done`
- `presenter_conclusion_done`

The debate engine maps streamed events to arguments, presenter output, and judge decisions.

## Available Scripts

From `package.json`:

- `npm run dev` - Run Next.js dev server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

- Frontend shows API base URL error:
  - Ensure `.env.local` exists and `NEXT_PUBLIC_DEBATE_API_BASE_URL` is set.
  - Rebuild/restart container after env changes.
- No live debate updates:
  - Verify backend SSE endpoint is reachable from browser.
  - Confirm `session_id` is being generated and sent.
- Port conflict on `3000`:
  - Free the port or adjust port mapping in `docker-compose.yml`.
- Stale dependencies in Docker dev:
  - Recreate volumes: `docker compose down -v && docker compose up --build`.

## Security Notes

- Current auth context is demo-mode (client-side session simulation).
- Do not treat client-side identity as secure authentication.
- Do not place secrets in `NEXT_PUBLIC_*` variables.

## Contributing

Suggested workflow:

1. Create a feature branch.
2. Make changes with focused commits.
3. Run lint and verify behavior locally or via Docker.
4. Open a PR with testing notes and screenshots for UI changes.

## License

No license file is currently included in this directory. Add a project license before public distribution.
