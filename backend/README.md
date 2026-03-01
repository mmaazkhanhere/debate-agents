# Debate Backend

Production-style FastAPI backend for AI debate orchestration, fully containerized with Docker Compose.

This repository is designed so a new developer can:
1. Clone the repo
2. Create a `.env`
3. Run one command

```bash
docker compose up --build
```

The full stack (FastAPI + Celery worker + Celery beat + Redis + SQLite persistence + frontend) starts with no additional manual setup.

## Table of Contents

- Overview
- Architecture
- Tech Stack
- Prerequisites
- Quick Start
- Environment Variables
- Running the Stack
- API Endpoints
- Project Structure
- Operational Commands
- Persistence and Data
- Health Checks and Startup Order
- Troubleshooting
- Security Notes
- Production Notes

## Overview

The backend provides:
- Debate creation and orchestration
- Streaming debate events over SSE
- Caching and concurrency locks for debate generation
- Async execution via Celery
- SQLite-backed persistence for local development

## Architecture

Services started by Docker Compose (from the repository root):
- `backend`: FastAPI application (`app.main:app`) on port `8000`
- `celery-worker`: executes queued debate jobs
- `celery-beat`: scheduler process (ready for periodic tasks)
- `redis`: cache + lock store + Celery broker/result backend + event transport
- `frontend`: Next.js app on port `3000`

High-level flow:
1. Client `POST /debate`
2. FastAPI validates request, checks cache/locks in `redis`, writes DB record, queues Celery task
3. Celery worker runs debate flow and publishes events to `redis`
4. Client consumes `GET /debate/{debate_id}/events` (SSE) from `redis`
5. Final metrics/status persist in SQLite

## Tech Stack

- Python 3.11
- FastAPI
- Celery
- Redis 7
- SQLAlchemy + SQLite
- Docker + Docker Compose
- `uv` for dependency and runtime execution inside containers

## Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- Git

Verify:

```bash
docker --version
docker compose version
```

## Quick Start

1. Clone and enter repository.
2. Create env file:

```bash
cp .env.example .env
```

3. Fill required secrets in `.env` (at least your LLM provider key, for example `GROQ_API_KEY` if your flows use Groq models).
4. Start all services (from the repository root):

```bash
docker compose up --build
```

5. Open API:
- Swagger UI: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

## Environment Variables

Core container/runtime variables:

| Variable | Default | Purpose |
|---|---|---|
| `REDIS_HOSTNAME` | `redis` | Redis host for cache, locks, broker/backend, and event transport |
| `REDIS_PORT` | `6379` | Redis port |
| `CELERY_BROKER_URL` | `redis://redis:6379/0` | Celery broker |
| `CELERY_RESULT_BACKEND` | `redis://redis:6379/0` | Celery result backend |
| `SQLITE_DATABASE_PATH` | `/app/data/debate.db` | SQLite file path in container |
| `OPENAI_API_KEY` / `GROQ_API_KEY` | unset | Provider API key(s) |

App tuning variables are listed in `.env.example` (cache TTL, retries, stream timeouts, model names, delays, pricing map).

## Running the Stack

Foreground (from the repository root):

```bash
docker compose up --build
```

Detached (from the repository root):

```bash
docker compose up --build -d
```

Stop (from the repository root):

```bash
docker compose down
```

Stop and remove volumes (from the repository root):

```bash
docker compose down -v
```

## API Endpoints

Main endpoints:
- `GET /health`
- `GET /redis-test`
- `POST /debate`
- `GET /debate/{debate_id}/events?session_id=...&user_id=...`
- `GET /debates?session_id=...&user_id=...`
- `GET /debates/analytics?session_id=...&user_id=...`
- `GET /debates/overview?session_id=...&user_id=...`

Example create debate:

```bash
curl -X POST "http://localhost:8000/debate" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Is remote work better for innovation?",
    "debater_1": "elon_musk",
    "debater_2": "greta",
    "session_id": "session-123",
    "user_id": "user-123"
  }'
```

Example stream events (SSE):

```bash
curl -N "http://localhost:8000/debate/<debate_id>/events?session_id=session-123&user_id=user-123"
```

## Project Structure

```text
app/
  main.py                  # FastAPI app
  routers/                 # HTTP routes
  debate_orchestration.py  # API-level orchestration + queueing + SSE reads
  tasks/                   # Celery tasks
  celery_app.py            # Celery app config
  db/                      # SQLAlchemy models/session/init
  core/config.py           # Environment-driven settings
src/
  flow.py                  # Debate flow
  events.py                # Event publishing into Redis streams
../docker-compose.yml      # Multi-service stack (root)
Dockerfile                 # Shared backend image for API/worker/beat
docker/entrypoint.sh       # Redis dependency wait logic
```

## Operational Commands

View logs (from the repository root):

```bash
docker compose logs -f backend celery-worker celery-beat redis
```

Open shell in backend container:

```bash
docker compose exec backend bash
```

Restart one service:

```bash
docker compose restart backend
```

## Persistence and Data

Named volumes:
- `sqlite_data` -> `/app/data` (SQLite database persistence)
- `redis_data` -> `/data` in `redis`

Data survives container restarts.  
Use `docker compose down -v` only when intentionally resetting state.

## Health Checks and Startup Order

- `redis` exposes Redis `PING` health checks.
- `backend`, `celery-worker`, and `celery-beat` wait for Redis via:
  - Compose `depends_on` with `condition: service_healthy`
  - `docker/entrypoint.sh` readiness checks
- Backend health check uses a TCP port probe, not repeated `/health` HTTP calls, to avoid noisy access logs.

## Troubleshooting

Common issues:

1. Docker daemon not running
- Symptom: errors about Docker engine/pipe not found
- Fix: start Docker Desktop and retry

2. Port already in use
- Symptom: `bind: address already in use` on `8000`
- Fix: free port or map another host port in `docker-compose.yml`

3. Missing env vars or bad API key
- Symptom: debate tasks fail during model calls
- Fix: verify `.env` values and restart stack

4. Want fresh local state
- Run:
```bash
docker compose down -v
docker compose up --build
```

## Security Notes

- Never commit `.env` or real API keys.
- Rotate leaked keys immediately.
- For production, move secrets to a managed secret store.
- Restrict CORS origins from defaults before public deployment.

## Production Notes

This setup is optimized for local reproducibility. For production hardening:
- Move from SQLite to PostgreSQL
- Add reverse proxy and TLS termination
- Use managed Redis or Redis with persistence/backup policy
- Configure structured logging and metrics
- Pin image tags and establish CI build/test/deploy pipeline
