#!/usr/bin/env bash
# Run DeepGuard AI backend from project root.
# Usage: ./run_backend.sh [port]
PORT=${1:-8000}
cd "$(dirname "$0")/backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
