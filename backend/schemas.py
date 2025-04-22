from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
import datetime
from datetime import date


# 用户相关Schema
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str
    birthday: Optional[date] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    birthday: Optional[date] = None
    avatar_url: Optional[str] = None
    balance: Optional[float] = None


class UserResponse(UserBase):
    id: int
    birthday: Optional[date]
    avatar_url: Optional[str]
    balance: float
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True


# 文章相关Schema
class ArticleBase(BaseModel):
    title: str
    content: Optional[str] = None


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(ArticleBase):
    pass


class ArticleResponse(ArticleBase):
    id: int
    author_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True


class ArticleDetail(ArticleResponse):
    author: UserResponse

    class Config:
        orm_mode = True


# 联系人相关Schema
class ContactBase(BaseModel):
    name: str
    province: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(ContactBase):
    pass


class ContactResponse(ContactBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True


# 认证相关Schema
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class PasswordChange(BaseModel):
    username: str
    old_password: str
    new_password: str


# 统计相关Schema
class AuthorStats(BaseModel):
    author_id: int
    username: str
    email: str
    avatar_url: Optional[str]
    article_count: int

    class Config:
        orm_mode = True