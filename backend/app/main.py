import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
