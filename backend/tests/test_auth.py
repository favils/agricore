from tests.conftest import auth_header

async def test_login_succeeds_with_correct_credentials(client, seeded_users):
    response = await client.post("/auth/token", data={"username": "test_admin", "password": "pw"})
    assert response.status_code == 200
    assert "access_token" in response.json()

async def test_login_fails_with_wrong_password(client, seeded_users):
    response = await client.post("/auth/token", data={"username": "test_admin", "password": "wrong"})
    assert response.status_code == 401

async def test_register_requires_admin(client, seeded_users):
    payload = {"username": "new_user", "password": "SomePass123!", "role": "Field Hand"}

    response = await client.post("/auth/register", json=payload, headers=auth_header(seeded_users["field_hand"]))
    assert response.status_code == 403

    response = await client.post("/auth/register", json=payload, headers=auth_header(seeded_users["admin"]))
    assert response.status_code == 201

async def test_register_rejects_duplicate_username(client, seeded_users):
    payload = {"username": "TEST_ADMIN", "password": "SomePass123!", "role": "Auditor"}
    response = await client.post("/auth/register", json=payload, headers=auth_header(seeded_users["admin"]))
    assert response.status_code == 400
