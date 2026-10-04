from enum import Enum

class EquipmentStatus(str, Enum):
    IDLE = "Idle"
    IN_USE = "In-Use"
    MAINTENANCE = "Maintenance"
    RETIRED = "Retired"

class FieldPriority(str, Enum):
    LOW = "Low"
    MED = "Medium"
    CRIT = "Critical"

class FieldStatus(str,Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In-Progress"
    COMPLETED = "Completed"
    FAILED = "Failed"

class UserRole(str, Enum):
    FARM_OP_ADMIN = "Farm Operations Admin"
    FIELD_HAND = "Field Hand"
    AUDITOR = "Auditor"
    