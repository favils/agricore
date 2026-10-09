import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app import storage
from app.dependencies import get_db, require_role
from app.models import UserRole
from app.routers import auth, equipment, farm, field_hand, field_job, service_report

load_dotenv()

app = FastAPI(
    title="AgriCore",
    description="Farm Management Service",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(farm.router)
app.include_router(equipment.router)
app.include_router(field_hand.router)
app.include_router(field_job.router)
app.include_router(service_report.router)

@app.get("/health")
async def health():
    return {"status": "ok"}

async def check_database(db: AsyncSession) -> str:
    try:
        await db.execute(text("SELECT 1"))
        return "ok"
    except Exception:
        return "unavailable"

def check_s3() -> str:
    try:
        storage.s3_client.head_bucket(Bucket=storage.BUCKET_NAME)
        return "ok"
    except Exception:
        return "unavailable"

@app.get("/health/ready")
async def health_ready(db: AsyncSession = Depends(get_db)):
    if await check_database(db) != "ok":
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"status": "unavailable"})
    return {"status": "ready"}

@app.get("/health/detail")
async def health_detail(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    return {"database": await check_database(db), "s3": check_s3()}
