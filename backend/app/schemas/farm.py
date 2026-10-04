from pydantic import BaseModel, ConfigDict, Field

class FarmCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    location_region: str = Field(min_length=1, max_length=150)
    capacity: int = Field(ge=0)
    supervisor_id: int

class FarmRead(FarmCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

class MaintenanceFlagRead(BaseModel):
    farm_id: int
    name: str
    total_equipment: int
    maintenance_equipment: int

    model_config = ConfigDict(from_attributes=True)
