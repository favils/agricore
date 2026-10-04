from pydantic import BaseModel, ConfigDict, Field

class FieldHandCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    farm_id: int

class FieldHandRead(FieldHandCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
