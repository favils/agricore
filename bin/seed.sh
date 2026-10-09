#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../backend"

if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
    source .env
fi

if [ -z "${DATABASE_URL:-}" ]; then
    echo "Error: DATABASE_URL not set - set it in backend's .env"
    exit 1
fi

PSQL_URL="${DATABASE_URL/+asyncpg/}"

if ! psql "$PSQL_URL" -c "SELECT 1" >/dev/null 2>&1; then
    echo "Error: cannot connect to the database"
    exit 1
fi

source .venv/Scripts/activate
python -m scripts.create_tables

if [ "${1:-}" = "--reset" ]; then
    if [ "${2:-}" != "--yes" ]; then
        read -p "this deletes all data & reloads it, continue? [y/n] " answer
        if [ "$answer" != "y" ]; then
            echo "Cancelled"
            exit 1
        fi
    fi
elif [ "$(psql "$PSQL_URL" -tAc "SELECT COUNT(*) FROM farms")" != "0" ]; then
    echo "Already seeded - use --reset to reload"
    exit 0
fi

psql "$PSQL_URL" -v ON_ERROR_STOP=1 -f sql/seed.sql

echo "Seed complete"
