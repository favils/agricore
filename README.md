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

## Deployment

Live on AWS (us-east-2):

| | URL |
| --- | --- |
| Frontend (CloudFront) | https://d3fagqqlyphr3m.cloudfront.net |
| API (Lambda Function URL) | https://jmdn5vmjkpz4hibzpt6232uyf40vvaut.lambda-url.us-east-2.on.aws |

```
Browser --HTTPS--> CloudFront --(Origin Access Control)--> S3 fv-agricore-frontend (private, React build)
Browser --HTTPS--> Lambda Function URL --> Lambda agricore-api (FastAPI + Mangum, VPC private subnets)
                                              |--(port 5432)--> RDS PostgreSQL database-1 (db.t3.micro)
                                              |--(S3 gateway endpoint)--> S3 fv-agricore-uploads (private)
```

### Steps taken

1. **Budget:** monthly cost budget using unblended costs, with an email alert at 80% and an action that stops the RDS instance at 70%.
2. **Networking:** default VPC and two of its subnets.
3. **Security groups:** `lambda-sg` with no inbound rules, and `db-sg` allowing PostgreSQL (5432) only from `lambda-sg` and the developer's IP.
4. **RDS:** PostgreSQL `db.t3.micro`, 20 GB gp3 with storage autoscaling off, single-AZ, security group `db-sg`, database `agricoredb`.
5. **Uploads bucket:** `fv-agricore-uploads`, with all public access blocked.
6. **S3 gateway endpoint:** `com.amazonaws.us-east-2.s3` (Gateway type) on the default VPC's route table.
7. **IAM role:** `agricore-lambda-role` with `AWSLambdaBasicExecutionRole`, `AWSLambdaVPCAccessExecutionRole`, and an inline policy limited to the uploads bucket.
8. **Package:** `bash bin/package.sh` builds `backend/package.zip` inside the `public.ecr.aws/lambda/python:3.12` Docker image from `backend/requirements-lambda.txt`.
9. **Lambda:** `agricore-api`, Python 3.12, x86_64, handler `lambda_handler.handler`, 512 MB, 30 s timeout, attached to the VPC with `lambda-sg`. Environment variables: `DATABASE_URL`, `SECRET_KEY`, `S3_BUCKET_NAME`, `FRONTEND_ORIGIN`.
10. **Function URL:** auth type NONE. CORS is handled only by FastAPI's `CORSMiddleware`, not by the Function URL.
11. **Seed:** `DATABASE_URL='<rds url>' bash bin/seed.sh`, run from the developer's machine.
12. **Frontend bucket:** `fv-agricore-frontend`, with all public access blocked and static website hosting disabled.
13. **Frontend build:** `frontend/.env.production` sets `VITE_API_URL` to the Function URL; then `npm run build` and `aws s3 sync dist/ s3://fv-agricore-frontend --delete`.
14. **CloudFront:** S3 origin with Origin Access Control, redirect HTTP to HTTPS, default root object `index.html`, and 403/404 errors served as `/index.html` with status 200.
15. **CORS:** the Lambda's `FRONTEND_ORIGIN` is set to the CloudFront URL.

### Redeploying

Backend:

```bash
bash bin/package.sh
aws lambda update-function-code --function-name agricore-api --zip-file fileb://backend/package.zip
```

Frontend:

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://fv-agricore-frontend --delete
aws cloudfront create-invalidation --distribution-id EJ0Z01PTJDXQC --paths "/*"
```

## Tests

```bash
psql -U postgres -c "CREATE DATABASE agricore_test;"
cd backend
source .venv/Scripts/activate
pytest
```
