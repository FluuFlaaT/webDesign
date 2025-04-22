from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Date, func
from sqlalchemy.orm import relationship
from database import Base
import datetime


class User(Base):
    """用户模型"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    birthday = Column(Date, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 关系
    articles = relationship("Article", back_populates="author")
    contacts = relationship("Contact", back_populates="user")


class Article(Base):
    """文章模型"""
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    content = Column(Text, nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 关系
    author = relationship("User", back_populates="articles")


class Contact(Base):
    """联系人模型"""
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), index=True, nullable=False)
    province = Column(String(50), nullable=True)
    city = Column(String(50), nullable=True)
    address = Column(String(200), nullable=True)
    postal_code = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="contacts")