from pydantic import BaseModel, ConfigDict, Field

from app.models import EquipmentStatus

class EquipmentBase(BaseModel):
    serial_number: str = Field(min_length=1, max_length=150)
    model: str = Field(min_length=1, max_length=150)
    status: EquipmentStatus = EquipmentStatus.IDLE
    fuel_level: int = Field(ge=0, le=100)
    farm_id: int

class EquipmentRead(EquipmentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class EquipmentCreate(EquipmentBase):
    pass
