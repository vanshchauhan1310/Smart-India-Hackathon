#!/usr/bin/env bash
# Simple local run script for the pose server using a Python venv.
# Usage:
#   python3 -m venv .venv
#   source .venv/bin/activate
#   pip install -r requirements.txt
#   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/creds.json
#   export OPENROUTER_API_KEY=sk-...
#   POSE_SERVER_HOST=0.0.0.0 POSE_SERVER_PORT=8000 python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

set -euo pipefail
if [ -z "${VIRTUAL_ENV:-}" ]; then
  echo "Activate your venv first (python3 -m venv .venv && source .venv/bin/activate)"
  exit 1
fi
pip install -r requirements.txt
if [ -z "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]; then
  echo "Warning: GOOGLE_APPLICATION_CREDENTIALS not set. Set it to your service account JSON for Google TTS if using that feature."
fi
POSE_SERVER_HOST=${POSE_SERVER_HOST:-0.0.0.0}
POSE_SERVER_PORT=${POSE_SERVER_PORT:-8000}
uvicorn server:app --host $POSE_SERVER_HOST --port $POSE_SERVER_PORT --reload
