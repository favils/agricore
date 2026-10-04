from datetime import datetime

from pydantic import BaseModel, ConfigDict

class ServiceReportRead(BaseModel):
    id: int
    field_job_id: int
    file_url: str
    notes: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
