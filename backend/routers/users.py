from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
from auth import get_current_user
from typing import List
import os
import boto3
from botocore.exceptions import NoCredentialsError
import uuid
import json

router = APIRouter(
    prefix="/users",
    tags=["用户"],
    responses={404: {"description": "Not found"}},
)

# S3客户端配置
s3_client = boto3.client(
    's3',
    endpoint_url=os.getenv("S3_ENDPOINT_URL", "http://minio:9000"),
    aws_access_key_id=os.getenv("S3_ACCESS_KEY", "minioadmin"),
    aws_secret_access_key=os.getenv("S3_SECRET_KEY", "minioadmin"),
    region_name=os.getenv("S3_REGION", "us-east-1")
)
BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "avatars")


@router.get("/me", response_model=schemas.UserResponse)
async def get_user_me(current_user: models.User = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return current_user


@router.put("/me", response_model=schemas.UserResponse)
async def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新当前登录用户信息"""
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/avatar", response_model=schemas.UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传用户头像"""
    # 检查文件类型
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="只能上传图片文件")
    
    # 生成唯一文件名
    file_extension = file.filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    
    try:
        # 确保存储桶存在，并设置为公开访问
        try:
            s3_client.head_bucket(Bucket=BUCKET_NAME)
        except:
            # 创建桶
            s3_client.create_bucket(Bucket=BUCKET_NAME)
            
            # 设置桶策略为公开读取
            bucket_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicRead",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{BUCKET_NAME}/*"]
                    }
                ]
            }
            # 应用桶策略
            s3_client.put_bucket_policy(
                Bucket=BUCKET_NAME,
                Policy=json.dumps(bucket_policy)
            )
        
        # 上传文件到S3
        file_content = await file.read()
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=new_filename,
            Body=file_content,
            ContentType=file.content_type,
            ACL='public-read'  # 设置对象为公开读取
        )
        
        # 生成正确的URL（直接使用公开访问URL）
        s3_public_url = os.getenv('S3_PUBLIC_URL', 'http://localhost:9000')
        avatar_url = f"{s3_public_url}/{BUCKET_NAME}/{new_filename}"
        
        # 更新用户头像URL
        current_user.avatar_url = avatar_url
        db.commit()
        db.refresh(current_user)
        
        return current_user
    
    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="S3存储凭证错误")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传头像失败: {str(e)}")