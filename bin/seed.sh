set -e

cd backend
source .venv/Scripts/activate

python -m scripts.create_tables
psql -h localhost -U postgres -d agricore_db -f sql/seed.sql

echo "Seed complete"
