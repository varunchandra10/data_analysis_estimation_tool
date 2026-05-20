from fastapi.testclient import TestClient
from core.database import Base, engine
from main import app
from uuid import uuid4

client = TestClient(app)


def setup_module(module):
    # create tables
    Base.metadata.create_all(bind=engine)


def test_register_and_login():
    suffix = uuid4().hex[:8]
    username = f"testuser_{suffix}"
    email = f"{username}@example.com"
    password = "password123"

    resp = client.post('/api/auth/register', json={
        'username': username,
        'email': email,
        'password': password
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data['status'] == 'success'
    assert data['data']['username'] == username
    assert data['data']['email'] == email

    # login
    resp = client.post('/api/auth/token', data={'username': username, 'password': password})
    assert resp.status_code == 200
    token_data = resp.json()
    assert token_data['status'] == 'success'
    assert 'access_token' in token_data['data']
    assert token_data['data']['token_type'] == 'bearer'
