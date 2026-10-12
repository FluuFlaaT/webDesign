from datetime import datetime, timedelta
from typing import Optional
import hashlib
import hmac
import bcrypt
import jwt
from jwt import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import os

# OAuth2密码认证流
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# JWT配置
SECRET_KEY = os.getenv("SECRET_KEY", "")
if len(SECRET_KEY.encode()) < 32 or SECRET_KEY in {
    "supersecretkey", "your_super_secret_key_here"
}:
    raise RuntimeError("SECRET_KEY 必须配置为至少32字节的随机密钥")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


def verify_password(plain_password, hashed_password):
    """验证密码"""
    if len(plain_password.encode()) > 72:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    except ValueError:
        return False


def get_password_hash(password):
    """获取密码哈希"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def password_version(user):
    """Bind sessions to the current password without storing its hash in a JWT."""
    return hmac.new(SECRET_KEY.encode(), user.hashed_password.encode(), hashlib.sha256).hexdigest()


def authenticate_user(db: Session, username: str, password: str):
    """验证用户"""
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM],
                             options={"require": ["exp", "sub", "pwd", "type"]})
        username: str = payload.get("sub")
        if not isinstance(username, str) or not username or payload["type"] != "access":
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    version = payload["pwd"]
    if (not isinstance(version, str) or len(version) != 64 or not version.isascii()
            or not hmac.compare_digest(version, password_version(user))):
        raise credentials_exception
    return user
