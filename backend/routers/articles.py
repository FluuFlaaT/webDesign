from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
from auth import get_current_user
from typing import List, Optional
from sqlalchemy import func

router = APIRouter(
    prefix="/articles",
    tags=["文章"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.ArticleResponse])
def get_articles(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="按标题搜索"),
    author_id: Optional[int] = Query(None, description="按作者ID筛选"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取文章列表"""
    query = db.query(models.Article)
    
    # 如果指定了作者ID，则只获取该作者的文章
    if author_id is not None:
        query = query.filter(models.Article.author_id == author_id)
    
    # 如果有搜索关键词，按标题进行模糊搜索
    if search:
        query = query.filter(models.Article.title.ilike(f"%{search}%"))
    
    articles = query.offset(skip).limit(limit).all()
    return articles


@router.post("/", response_model=schemas.ArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(
    article: schemas.ArticleCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新文章"""
    db_article = models.Article(**article.dict(), author_id=current_user.id)
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


@router.get("/{article_id}", response_model=schemas.ArticleDetail)
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """获取指定文章详情"""
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="文章不存在")
    return article


@router.put("/{article_id}", response_model=schemas.ArticleResponse)
def update_article(
    article_id: int,
    article_update: schemas.ArticleUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新文章"""
    db_article = db.query(models.Article).filter(
        models.Article.id == article_id,
        models.Article.author_id == current_user.id
    ).first()
    
    if not db_article:
        raise HTTPException(
            status_code=404, 
            detail="文章不存在或您无权修改此文章"
        )
    
    # 更新文章信息
    for key, value in article_update.dict(exclude_unset=True).items():
        setattr(db_article, key, value)
    
    db.commit()
    db.refresh(db_article)
    return db_article


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除文章"""
    article = db.query(models.Article).filter(
        models.Article.id == article_id,
        models.Article.author_id == current_user.id
    ).first()
    
    if not article:
        raise HTTPException(
            status_code=404, 
            detail="文章不存在或您无权删除此文章"
        )
    
    db.delete(article)
    db.commit()
    return None


@router.get("/author/stats", response_model=List[schemas.AuthorStats])
def get_author_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """获取作者统计数据"""
    stats = db.query(
        models.User.id.label('author_id'),
        models.User.username,
        models.User.email,
        models.User.avatar_url,
        func.count(models.Article.id).label('article_count')
    ).join(
        models.Article, 
        models.User.id == models.Article.author_id, 
        isouter=True
    ).group_by(
        models.User.id
    ).all()
    
    return stats