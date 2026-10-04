# AgriCore: Farm Operations Command Center

A full-stack command center for the Prairie Crest Agricultural Cooperative. It tracks farms, shared heavy equipment, field hands, field jobs and service reports, and answers the cooperative's key operational questions through SQL aggregation endpoints and a dashboard.

## Getting started

```bash
bash bin/setup.sh

psql -U postgres -c "CREATE DATABASE agricore_db;"

bash bin/seed.sh

cd backend
source .venv/Scripts/activate
uvicorn app.main:app --reload

cd frontend
npm run dev
```
