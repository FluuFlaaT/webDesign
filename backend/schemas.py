from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
from typing import Optional, List
import datetime
from datetime import date


class PasswordInput(BaseModel):
    @field_validator('password', 'new_password', check_fields=False)
    @classmethod
    def validate_password(cls, value):
        if not 8 <= len(value.encode('utf-8')) <= 72:
            raise ValueError('密码须为8到72字节')
        return value


# 用户相关Schema
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase, PasswordInput):
    password: str
    birthday: Optional[date] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    birthday: Optional[date] = None
    model_config = ConfigDict(extra='forbid')


class UserResponse(UserBase):
    id: int
    birthday: Optional[date]
    avatar_url: Optional[str]
    balance: float
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


class ArticleDetail(ArticleResponse):
    author: UserResponse

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


# 认证相关Schema
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class PasswordChange(PasswordInput):
    username: str
    old_password: str
    new_password: str


class BirthdayVerification(BaseModel):
    username: str
    birthday: date


class PasswordReset(BaseModel):
    username: str
    new_password: str


# 统计相关Schema
class AuthorStats(BaseModel):
    author_id: int
    username: str
    email: str
    avatar_url: Optional[str]
    article_count: int

    model_config = ConfigDict(from_attributes=True)
