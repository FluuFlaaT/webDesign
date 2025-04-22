from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建FastAPI应用
app = FastAPI(title="文章及用户管理系统API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中请替换为实际的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
# 在后续Sprint中添加的路由...

# 启动事件
@app.on_event("startup")
async def startup_event():
    # 将在后续Sprint中添加数据库连接和初始化逻辑
    print("FastAPI应用已启动")

# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    # 将在后续Sprint中添加数据库关闭逻辑
    print("FastAPI应用已关闭")