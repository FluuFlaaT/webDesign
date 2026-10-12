from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from starlette.responses import JSONResponse
import os
from dotenv import load_dotenv
from database import engine, Base, init_db
import models
from routers import auth, users, contacts, articles
import logging
import time

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

# 创建FastAPI应用
app = FastAPI(title="文章及用户管理系统API")


class RequestBodyLimitMiddleware:
    """Bound multipart parsing as well as requests without Content-Length."""
    def __init__(self, app):
        self.app = app
        self.limit = int(os.getenv("MAX_REQUEST_BYTES", 6 * 1024 * 1024))

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        for name, value in scope.get('headers', []):
            if name.lower() == b'content-length':
                try:
                    if int(value) < 0:
                        raise ValueError
                    if int(value) > self.limit:
                        return await JSONResponse({'detail': '请求体过大'}, status_code=413)(scope, receive, send)
                except ValueError:
                    return await JSONResponse({'detail': '无效的 Content-Length'}, status_code=400)(scope, receive, send)
        total = 0

        async def limited_receive():
            nonlocal total
            message = await receive()
            if message['type'] == 'http.request':
                total += len(message.get('body', b''))
                if total > self.limit:
                    raise HTTPException(status_code=413, detail='请求体过大')
            return message

        await self.app(scope, limited_receive, send)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(',') if origin.strip() and origin.strip() != '*'],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestBodyLimitMiddleware)

# 健康检查路由
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "FastAPI服务运行正常"
    }

# API版本前缀
API_V1_PREFIX = "/api/v1"

# 引入API路由
app.include_router(auth.router, prefix=API_V1_PREFIX)
app.include_router(users.router, prefix=API_V1_PREFIX)
app.include_router(contacts.router, prefix=API_V1_PREFIX)
app.include_router(articles.router, prefix=API_V1_PREFIX)

# 启动事件
@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI应用正在启动...")
    
    # 尝试初始化数据库连接和表
    try:
        logger.info("尝试初始化数据库...")
        init_db(max_retries=10, retry_interval=5)
        logger.info("数据库初始化成功")
    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
        logger.warning("应用将继续启动，但部分功能可能不可用")
    
    logger.info("FastAPI应用已启动")

# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("FastAPI应用已关闭")
