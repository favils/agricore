#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

command -v python >/dev/null || { echo "Error: python is not installed"; exit 1; }
command -v npm >/dev/null || { echo "Error: npm is not installed"; exit 1; }

cd backend

if [ ! -d .venv ]; then
    python -m venv .venv
fi

source .venv/Scripts/activate
pip install -r requirements.txt

if [ ! -f .env ]; then
    printf 'DATABASE_URL=\nSECRET_KEY=\nS3_BUCKET_NAME=\n' > .env
    echo "Created backend/.env - fill in its values"
fi

cd ../frontend
npm install

echo "Setup complete"
