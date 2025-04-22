from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import models
import schemas
from database import get_db
from auth import authenticate_user, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from typing import List

router = APIRouter(
    prefix="/auth",
    tags=["认证"],
    responses={404: {"description": "Not found"}},
)


@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否已存在
    db_user_by_username = db.query(models.User).filter(
        models.User.username == user.username).first()
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 检查邮箱是否已存在
    db_user_by_email = db.query(models.User).filter(
        models.User.email == user.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="邮箱已存在")

    # 创建新用户
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        birthday=user.birthday,
        balance=0.0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """用户登录"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(password_data: schemas.PasswordChange, db: Session = Depends(get_db)):
    """修改密码"""
    user = authenticate_user(db, password_data.username, password_data.old_password)
    if not user:
        raise HTTPException(status_code=400, detail="用户名或原密码错误")

    # 更新密码
    user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "密码修改成功"}


@router.post("/verify-birthday", status_code=status.HTTP_200_OK)
def verify_birthday(verification_data: schemas.BirthdayVerification, db: Session = Depends(get_db)):
    """验证生日以重置密码"""
    user = db.query(models.User).filter(models.User.username == verification_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 验证生日是否匹配
    if not user.birthday or user.birthday != verification_data.birthday:
        raise HTTPException(status_code=400, detail="生日信息不匹配")
    
    return {"message": "验证成功", "verified": True}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(reset_data: schemas.PasswordReset, db: Session = Depends(get_db)):
    """重置密码"""
    user = db.query(models.User).filter(models.User.username == reset_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 更新密码
    user.hashed_password = get_password_hash(reset_data.new_password)
    db.commit()
    return {"message": "密码重置成功"}