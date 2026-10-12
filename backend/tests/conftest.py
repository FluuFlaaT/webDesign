import os
import secrets
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ['SECRET_KEY'] = secrets.token_urlsafe(48)
os.environ['DATABASE_URL'] = 'sqlite://'
os.environ['MAX_REQUEST_BYTES'] = '2048'
os.environ['MAX_UPLOAD_BYTES'] = '1024'
os.environ['MAX_AVATAR_PIXELS'] = '10000'
os.environ.pop('AWS_PROFILE', None)
os.environ.pop('AWS_DEFAULT_PROFILE', None)

import main
from database import Base, get_db


@pytest.fixture
def client(monkeypatch):
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    sessions = sessionmaker(bind=engine)
    Base.metadata.create_all(engine)

    def get_test_db():
        with sessions() as db:
            yield db

    monkeypatch.setattr(main, 'init_db', lambda **kwargs: True)
    main.app.dependency_overrides[get_db] = get_test_db
    with TestClient(main.app) as test_client:
        yield test_client
    main.app.dependency_overrides.clear()
    engine.dispose()


@pytest.fixture
def account(client):
    def create(name='alice'):
        password = 'Original-password-123'
        response = client.post('/api/v1/auth/register', json={
            'username': name, 'email': f'{name}@example.com', 'password': password,
            'birthday': '2000-01-01',
        })
        assert response.status_code == 200, response.text
        login = client.post('/api/v1/auth/login', data={'username': name, 'password': password})
        assert login.status_code == 200, login.text
        token = login.json()['access_token']
        return response.json(), {'Authorization': f'Bearer {token}'}, password
    return create
