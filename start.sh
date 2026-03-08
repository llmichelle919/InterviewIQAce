#!/usr/bin/env bash
set -e

# ── InterviewAce startup script ──────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
  if [ -f "$ROOT/backend/.env" ]; then
    export $(grep -v '^#' "$ROOT/backend/.env" | xargs)
  else
    echo "❌  ANTHROPIC_API_KEY is not set."
    echo "   Create backend/.env with: ANTHROPIC_API_KEY=sk-ant-..."
    exit 1
  fi
fi

# Install backend deps if venv not present
if [ ! -d "$ROOT/backend/.venv" ]; then
  echo "📦  Setting up Python virtual environment..."
  python3 -m venv "$ROOT/backend/.venv"
  "$ROOT/backend/.venv/bin/pip" install -q -r "$ROOT/backend/requirements.txt"
  echo "✅  Backend dependencies installed."
fi

# Install frontend deps if node_modules not present
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "📦  Installing frontend dependencies..."
  cd "$ROOT/frontend" && npm install --silent
  echo "✅  Frontend dependencies installed."
fi

echo ""
echo "🚀  Starting InterviewAce..."
echo "   Backend  → http://localhost:8000"
echo "   Frontend → http://localhost:5173"
echo ""
echo "   Press Ctrl+C to stop both servers."
echo ""

# Start backend
"$ROOT/backend/.venv/bin/uvicorn" main:app --app-dir "$ROOT/backend" --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend
cd "$ROOT/frontend" && npm run dev &
FRONTEND_PID=$!

# Cleanup on exit
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
