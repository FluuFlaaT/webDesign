from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import time
import logging

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

# 数据库连接URL
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"mysql+pymysql://{os.getenv('MYSQL_USER', 'app_user')}:{os.getenv('MYSQL_PASSWORD', 'app_password')}@{os.getenv('MYSQL_HOST', 'mysql')}:{os.getenv('MYSQL_PORT', '3306')}/{os.getenv('MYSQL_DATABASE', 'article_db')}"
)

# 创建数据库引擎，但暂时不实际连接
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # 添加连接池预检查
    pool_recycle=3600,   # 连接池回收时间
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建Base类，所有模型将继承此类
Base = declarative_base()

# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 初始化数据库连接（带重试机制）
def init_db(max_retries=10, retry_interval=5):
    """尝试连接数据库并创建表，带有重试机制"""
    retries = 0
    
    while retries < max_retries:
        try:
            # 尝试连接数据库
            with engine.connect() as connection:
                logger.info("成功连接到MySQL数据库")
                # 创建数据库表
                Base.metadata.create_all(bind=engine)
                logger.info("数据库表创建成功")
                return True
        except Exception as e:
            retries += 1
            logger.warning(f"连接MySQL失败 (尝试 {retries}/{max_retries}): {str(e)}")
            if retries < max_retries:
                logger.info(f"等待 {retry_interval} 秒后重试...")
                time.sleep(retry_interval)
            else:
                logger.error("达到最大重试次数，无法连接到MySQL数据库")
                raise
    
    return False