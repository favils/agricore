from pydantic import BaseModel, ConfigDict, Field

from app.models import FieldPriority, FieldStatus

class FieldJobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    priority: FieldPriority
    status: FieldStatus = FieldStatus.PENDING
    equipment_id: int
    field_hand_id: int

class FieldJobRead(FieldJobCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

class FieldJobStatusUpdate(BaseModel):
    status: FieldStatus

class DiscrepencyRead(BaseModel):
    field_job_id: int
    title: str
    equipment_id: int
    field_hand_id: int
    equipment_farm_id: int
    field_hand_farm_id: int

    model_config = ConfigDict(from_attributes=True)

class CompletionRead(BaseModel):
    model: str
    completed: int
    failed: int

    model_config = ConfigDict(from_attributes=True)

class SupervisorActiveFieldHandsRead(BaseModel):
    supervisor_id: int
    active_field_hand_count: int
