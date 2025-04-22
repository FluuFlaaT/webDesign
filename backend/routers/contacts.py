from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
import models
import schemas
from database import get_db
from auth import get_current_user
from typing import List, Optional

router = APIRouter(
    prefix="/contacts",
    tags=["联系人"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.ContactResponse])
def get_contacts(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="按姓名搜索"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的联系人列表"""
    query = db.query(models.Contact).filter(models.Contact.user_id == current_user.id)
    
    # 如果有搜索关键词，按姓名进行模糊搜索
    if search:
        query = query.filter(models.Contact.name.ilike(f"%{search}%"))
    
    contacts = query.offset(skip).limit(limit).all()
    return contacts


@router.post("/", response_model=schemas.ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact: schemas.ContactCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新联系人"""
    db_contact = models.Contact(**contact.dict(), user_id=current_user.id)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.get("/{contact_id}", response_model=schemas.ContactResponse)
def get_contact(
    contact_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取指定联系人"""
    contact = db.query(models.Contact).filter(
        models.Contact.id == contact_id,
        models.Contact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="联系人不存在")
    return contact


@router.put("/{contact_id}", response_model=schemas.ContactResponse)
def update_contact(
    contact_id: int,
    contact_update: schemas.ContactUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新联系人"""
    db_contact = db.query(models.Contact).filter(
        models.Contact.id == contact_id,
        models.Contact.user_id == current_user.id
    ).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="联系人不存在")
    
    # 更新联系人信息
    for key, value in contact_update.dict(exclude_unset=True).items():
        setattr(db_contact, key, value)
    
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除联系人"""
    contact = db.query(models.Contact).filter(
        models.Contact.id == contact_id,
        models.Contact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="联系人不存在")
    
    db.delete(contact)
    db.commit()
    return None