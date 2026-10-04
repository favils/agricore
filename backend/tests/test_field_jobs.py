import pytest_asyncio

from app.models import Equipment, EquipmentStatus, FieldHand, FieldJob, FieldPriority, FieldStatus
from tests.conftest import auth_header

@pytest_asyncio.fixture
async def seeded_field_job(db_session, seeded_farm):
    equipment = Equipment(
        serial_number="TX-0001",
        model="Tractor",
        status=EquipmentStatus.IDLE,
        fuel_level=75,
        farm_id=seeded_farm.id,
    )
    field_hand = FieldHand(name="Test Hand", farm_id=seeded_farm.id)
    db_session.add_all([equipment, field_hand])
    await db_session.commit()
    await db_session.refresh(equipment)
    await db_session.refresh(field_hand)

    field_job = FieldJob(
        title="Test Job",
        priority=FieldPriority.LOW,
        status=FieldStatus.PENDING,
        equipment_id=equipment.id,
        field_hand_id=field_hand.id,
    )
    db_session.add(field_job)
    await db_session.commit()
    await db_session.refresh(field_job)
    return field_job

async def test_admin_can_update_status(client, seeded_users, seeded_field_job):
    response = await client.patch(
        f"/fieldjobs/{seeded_field_job.id}/status",
        json={"status": "Completed"},
        headers=auth_header(seeded_users["admin"]),
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Completed"

async def test_field_hand_can_update_status(client, seeded_users, seeded_field_job):
    response = await client.patch(
        f"/fieldjobs/{seeded_field_job.id}/status",
        json={"status": "Failed"},
        headers=auth_header(seeded_users["field_hand"]),
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Failed"

async def test_auditor_cannot_update_status(client, seeded_users, seeded_field_job):
    response = await client.patch(
        f"/fieldjobs/{seeded_field_job.id}/status",
        json={"status": "Completed"},
        headers=auth_header(seeded_users["auditor"]),
    )
    assert response.status_code == 403

async def test_missing_field_job_returns_404(client, seeded_users):
    response = await client.patch(
        "/fieldjobs/999999/status",
        json={"status": "Completed"},
        headers=auth_header(seeded_users["admin"]),
    )
    assert response.status_code == 404
