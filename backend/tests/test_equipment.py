from tests.conftest import auth_header

async def test_list_equipment_requires_authentication(client):
    response = await client.get("/equipment")
    assert response.status_code == 401

async def test_auditor_can_list_equipment(client, seeded_users):
    response = await client.get("/equipment", headers=auth_header(seeded_users["auditor"]))
    assert response.status_code == 200

async def test_create_equipment_forbidden_for_field_hand(client, seeded_users, seeded_farm):
    payload = {"serial_number": "TX-1001", "model": "Tractor", "status": "Idle", "fuel_level": 50, "farm_id": seeded_farm.id}
    response = await client.post("/equipment", json=payload, headers=auth_header(seeded_users["field_hand"]))
    assert response.status_code == 403

async def test_create_equipment_succeeds_for_admin(client, seeded_users, seeded_farm):
    payload = {"serial_number": "TX-1001", "model": "Tractor", "status": "Idle", "fuel_level": 50, "farm_id": seeded_farm.id}
    response = await client.post("/equipment", json=payload, headers=auth_header(seeded_users["admin"]))
    assert response.status_code == 201
    assert response.json()["serial_number"] == "TX-1001"

async def test_low_fuel_filter(client, seeded_users, seeded_farm):
    headers = auth_header(seeded_users["admin"])
    low = {"serial_number": "LOW-01", "model": "Tractor", "status": "Idle", "fuel_level": 10, "farm_id": seeded_farm.id}
    high = {"serial_number": "HIGH-01", "model": "Tractor", "status": "Idle", "fuel_level": 90, "farm_id": seeded_farm.id}

    await client.post("/equipment", json=low, headers=headers)
    await client.post("/equipment", json=high, headers=headers)

    response = await client.get("/equipment?max_fuel=20", headers=headers)
    serials = [equipment["serial_number"] for equipment in response.json()]

    assert "LOW-01" in serials
    assert "HIGH-01" not in serials
