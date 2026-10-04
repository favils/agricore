set -e

cd backend

if [ ! -d ".venv" ]; then
    python -m venv .venv
fi

source .venv/Scripts/activate
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/agricore_db" > .env
    echo "SECRET_KEY=change-me" >> .env
    echo "Created backend/.env - update it with your database password and a secret key"
fi

cd ../frontend
npm install

echo "Setup complete"
