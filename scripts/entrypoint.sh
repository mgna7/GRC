#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL environment variable is required" >&2
    exit 1
fi

python <<'PY'
import os
import sys
import time

from sqlalchemy import create_engine, text

database_url = os.environ["DATABASE_URL"]
engine = create_engine(database_url, future=True)

for attempt in range(1, 11):
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        break
    except Exception as exc:  # pragma: no cover
        print(f"[entrypoint] Waiting for database ({attempt}/10): {exc}", flush=True)
        time.sleep(3)
else:
    print("[entrypoint] Database not ready after retries", file=sys.stderr)
    sys.exit(1)
PY

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
