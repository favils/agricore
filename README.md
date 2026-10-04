# AgriCore: Farm Operations Command Center

A full-stack command center for the Prairie Crest Agricultural Cooperative. Tracks farms, shared heavy equipment, field hands, field jobs and service reports, and answers the cooperative's key operational questions through SQL aggregation endpoints and a dashboard.

**Stack:** React (Vite) + Material UI · FastAPI + Pydantic v2 · PostgreSQL + SQLAlchemy 2.0

## Getting started

Project setup in GitBash Terminal:

```bash
bash bin/setup.sh

psql -U postgres -c "CREATE DATABASE agricore_db;"

bash bin/seed.sh
```

Now start the backend and frontend in two terminals:

```bash
cd backend
source .venv/Scripts/activate
uvicorn app.main:app --reload
```

```bash
cd frontend
npm run dev
```

Will be available at http://localhost:5173 in your browser.

## Demo logins

| Username | Role |
| --- | --- |
| `admin` | Farm Operations Admin |
| `fieldhand` | Field Hand |
| `auditor` | Auditor |


Password: `password`

## API

The full interactive API docs are at http://127.0.0.1:8000/docs

| Method | Endpoint | Who |
| --- | --- | --- |
| POST | `/auth/token` | Anyone (login) |
| POST | `/auth/register` | Admin |
| GET / PATCH / DELETE | `/auth/users`, `/auth/users/{id}` | Admin |
| GET | `/farms`, `/equipment`, `/fieldhands`, `/fieldjobs`, `/service-reports` | All roles |
| POST / PUT / DELETE | `/farms`, `/equipment`, `/fieldhands`, `/fieldjobs` | Admin |
| PATCH | `/fieldjobs/{id}/status` | Admin, Field Hand |
| POST | `/service-reports` | Admin, Field Hand |

### Business question endpoints

| Question | Endpoint |
| --- | --- |
| Low Fuel Alert | `GET /equipment?max_fuel=20` |
| Co-Location Discrepancy | `GET /fieldjobs/discrepencies` |
| Reliability Metrics | `GET /fieldjobs/completion` |
| Maintenance Flags | `GET /farms/maintenance-flags` |
| Reporting Lines | `GET /fieldjobs/supervisor-active-field-hands?supervisor_id=201` |

## Tests

```bash
psql -U postgres -c "CREATE DATABASE agricore_test;"
cd backend
source .venv/Scripts/activate
pytest
```
