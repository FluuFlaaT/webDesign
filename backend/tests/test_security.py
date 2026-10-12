import io
import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from PIL import Image

import auth
from routers import users


def test_public_profile_data_cannot_reset_password(client, account):
    user, _, password = account()
    _, other_headers, _ = account('bob')
    profile = client.get(f"/api/v1/users/{user['id']}", headers=other_headers).json()
    assert client.post('/api/v1/auth/verify-birthday', json={
        'username': profile['username'], 'birthday': profile['birthday'],
    }).status_code == 410
    for headers in ({}, other_headers):
        assert client.post('/api/v1/auth/reset-password', headers=headers, json={
            'username': user['username'], 'new_password': 'Attacker-password-123',
        }).status_code == 410
    assert client.post('/api/v1/auth/login', data={
        'username': user['username'], 'password': password,
    }).status_code == 200


@pytest.mark.parametrize('fields', [{'balance': 1000000}, {'avatar_url': 'javascript:alert(1)'}])
def test_profile_rejects_protected_fields(client, account, fields):
    _, headers, _ = account()
    assert client.put('/api/v1/users/me', headers=headers, json=fields).status_code == 422
    profile = client.get('/api/v1/users/me', headers=headers).json()
    assert profile['balance'] == 0 and profile['avatar_url'] is None
    assert client.put('/api/v1/users/me', headers=headers, json={'email': 'updated@example.com'}).status_code == 200


def test_password_change_revokes_sessions(client, account):
    user, headers, password = account()
    assert client.get('/api/v1/users/me', headers=headers).status_code == 200
    body = {'username': user['username'], 'old_password': 'wrong', 'new_password': 'New-password-123'}
    assert client.post('/api/v1/auth/change-password', json=body).status_code == 400
    body['old_password'] = password
    assert client.post('/api/v1/auth/change-password', json=body).status_code == 200
    assert client.get('/api/v1/users/me', headers=headers).status_code == 401
    assert client.post('/api/v1/auth/login', data={'username': user['username'], 'password': password}).status_code == 401
    login = client.post('/api/v1/auth/login', data={'username': user['username'], 'password': body['new_password']})
    assert login.status_code == 200
    assert client.get('/api/v1/users/me', headers={'Authorization': 'Bearer ' + login.json()['access_token']}).status_code == 200


@pytest.mark.parametrize('case', ['missing-exp', 'missing-pwd', 'wrong-type', 'expired', 'wrong-key', 'non-string-sub', 'non-ascii-pwd'])
def test_invalid_tokens_are_rejected(client, account, case):
    _, headers, _ = account()
    claims = jwt.decode(headers['Authorization'].split()[1], auth.SECRET_KEY, algorithms=['HS256'])
    key = auth.SECRET_KEY
    if case == 'missing-exp':
        del claims['exp']
    elif case == 'missing-pwd':
        del claims['pwd']
    elif case == 'wrong-type':
        claims['type'] = 'reset'
    elif case == 'expired':
        claims['exp'] = datetime.now(timezone.utc) - timedelta(seconds=1)
    elif case == 'wrong-key':
        key = 'attacker-key-' * 4
    elif case == 'non-ascii-pwd':
        claims['pwd'] = '密' * 64
    else:
        claims['sub'] = 123
    token = jwt.encode(claims, key, algorithm='HS256')
    assert client.get('/api/v1/users/me', headers={'Authorization': 'Bearer ' + token}).status_code == 401


@pytest.mark.parametrize('password', ['short', 'a' * 73, '密' * 25])
def test_unsafe_password_lengths_rejected(client, password):
    assert client.post('/api/v1/auth/register', json={
        'username': 'alice', 'email': 'alice@example.com', 'password': password,
    }).status_code == 422


def test_bcrypt_does_not_truncate_login_passwords(client, account):
    user, _, _ = account()
    assert client.post('/api/v1/auth/login', data={'username': user['username'], 'password': '密' * 25}).status_code == 401


def test_other_users_cannot_modify_contacts_or_articles(client, account):
    _, owner, _ = account()
    _, other, _ = account('bob')
    for resource, body in [('contacts', {'name': 'Private contact'}), ('articles', {'title': 'Article', 'content': 'Body'})]:
        created = client.post(f'/api/v1/{resource}/', headers=owner, json=body)
        assert created.status_code == 201
        path = f"/api/v1/{resource}/{created.json()['id']}"
        assert client.put(path, headers=other, json=body).status_code == 404
        assert client.delete(path, headers=other).status_code == 404
        if resource == 'contacts':
            assert client.get(path, headers=other).status_code == 404
        assert client.get(path, headers=owner).status_code == 200


@pytest.mark.parametrize('content', [b'<svg onload="alert(1)"></svg>', b'<html>attack</html>', b'', b'\x89PNG\r\n\x1a\ntruncated'])
def test_fake_images_rejected_before_storage(client, account, monkeypatch, content):
    _, headers, _ = account()
    monkeypatch.setattr(users, 'store_avatar', lambda *args: pytest.fail('invalid content reached storage'))
    assert client.post('/api/v1/users/avatar', headers=headers, files={'file': ('avatar.png', content, 'image/png')}).status_code == 400


def test_avatar_is_reencoded_without_active_payload(client, account, monkeypatch):
    _, headers, _ = account()
    image = io.BytesIO()
    Image.new('RGB', (2, 2), 'blue').save(image, format='PNG')
    saved = []
    monkeypatch.setattr(users, 'store_avatar', lambda name, content: saved.append((name, content)))
    response = client.post('/api/v1/users/avatar', headers=headers, files={
        'file': ('../../attack.html', image.getvalue() + b'<script>attack</script>', 'text/html'),
    })
    assert response.status_code == 200, response.text
    name, content = saved[0]
    assert name.endswith('.png') and '/' not in name
    assert b'<script>' not in content
    assert Image.open(io.BytesIO(content)).format == 'PNG'


def test_oversized_avatar_rejected(client, account, monkeypatch):
    _, headers, _ = account()
    monkeypatch.setattr(users, 'store_avatar', lambda *args: pytest.fail('oversized content reached storage'))
    assert client.post('/api/v1/users/avatar', headers=headers, files={'file': ('avatar.png', b'x' * 1025, 'image/png')}).status_code == 413


def test_pixel_limit(client, account):
    _, headers, _ = account()
    image = io.BytesIO()
    Image.new('RGB', (101, 100)).save(image, format='PNG')
    assert client.post('/api/v1/users/avatar', headers=headers, files={'file': ('avatar.png', image.getvalue(), 'image/png')}).status_code == 400


@pytest.mark.parametrize('chunked', [False, True])
def test_request_limit_with_and_without_content_length(client, chunked):
    body = (chunk for chunk in [b'x' * 1024] * 3) if chunked else b'x' * 3072
    response = client.post('/api/v1/auth/register', content=body, headers={'Content-Type': 'application/json'})
    assert response.status_code == 413


def test_cors_allows_only_configured_origins(client):
    headers = {'Access-Control-Request-Method': 'POST', 'Origin': 'https://attacker.example'}
    assert 'access-control-allow-origin' not in client.options('/api/v1/auth/login', headers=headers).headers
    headers['Origin'] = 'http://localhost:3000'
    assert client.options('/api/v1/auth/login', headers=headers).headers['access-control-allow-origin'] == headers['Origin']


@pytest.mark.parametrize('key', ['', 'supersecretkey', 'your_super_secret_key_here'])
def test_weak_secret_fails_closed(key):
    result = subprocess.run([sys.executable, '-c', 'import auth'], cwd=Path(auth.__file__).parent,
                            env={**os.environ, 'SECRET_KEY': key}, capture_output=True)
    assert result.returncode != 0
    assert b'RuntimeError' in result.stderr
