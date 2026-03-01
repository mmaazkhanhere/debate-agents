#!/usr/bin/env bash
set -euo pipefail

if [[ "${WAIT_FOR_REDIS:-1}" == "1" ]]; then
  python - <<'PY'
import os
import sys
import time

import redis

timeout_seconds = float(os.getenv("WAIT_FOR_REDIS_TIMEOUT_SECONDS", "90"))

endpoints = [
    (
        "cache",
        os.getenv("REDIS_CACHE_HOSTNAME") or os.getenv("REDIS_HOSTNAME", "redis"),
        int(os.getenv("REDIS_CACHE_PORT") or os.getenv("REDIS_PORT", "6379")),
    ),
    (
        "events",
        os.getenv("REDIS_EVENTS_HOSTNAME") or os.getenv("REDIS_HOSTNAME", "redis"),
        int(os.getenv("REDIS_EVENTS_PORT") or os.getenv("REDIS_PORT", "6379")),
    ),
]

for name, host, port in endpoints:
    deadline = time.time() + timeout_seconds
    last_error = None
    while time.time() < deadline:
        try:
            redis.Redis(
                host=host,
                port=port,
                socket_connect_timeout=2,
                decode_responses=True,
            ).ping()
            print(f"Redis ({name}) is ready at {host}:{port}")
            break
        except Exception as exc:
            last_error = exc
            time.sleep(1)
    else:
        print(
            f"Timed out waiting for Redis ({name}) at {host}:{port}. Last error: {last_error}",
            file=sys.stderr,
        )
        sys.exit(1)
PY
fi

exec "$@"
