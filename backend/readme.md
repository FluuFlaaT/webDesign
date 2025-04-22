# 文章及用户管理系统 - 后端

这是文章及用户管理系统的后端部分，基于FastAPI和Python构建。

## 技术栈

- Python 3.9+
- FastAPI
- SQLAlchemy (ORM)
- PyMySQL (MySQL连接器)
- Python-Jose (JWT认证)
- Boto3 (AWS/MinIO S3客户端)

## 目录结构

```
backend/
├── main.py           # FastAPI应用入口
├── requirements.txt  # Python依赖
├── Dockerfile        # 构建Docker镜像配置
└── app/              # 应用代码目录（后续开发添加）
    ├── api/          # API路由
    ├── core/         # 核心配置
    ├── db/           # 数据库模型和连接
    ├── models/       # Pydantic模型
    ├── services/     # 业务逻辑
    └── utils/        # 工具函数
```

## 本地开发

### 环境准备

1. 安装Python 3.9+
2. 创建虚拟环境
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # 或
   .\venv\Scripts\activate   # Windows
   ```
3. 安装依赖
   ```bash
   pip install -r requirements.txt
   ```

### 运行开发服务器

```bash
uvicorn main:app --reload
```

访问 http://localhost:8000/health 检查服务是否正常运行。
API文档可通过 http://localhost:8000/docs 查看。

## Docker部署

在项目根目录使用Docker Compose启动后端服务：

```bash
docker compose up backend
```

## 环境变量

主要环境变量在项目根目录的`.env`文件中配置，包括：

- `MYSQL_USER` - MySQL用户名
- `MYSQL_PASSWORD` - MySQL密码
- `MYSQL_HOST` - MySQL主机地址
- `MYSQL_PORT` - MySQL端口
- `MYSQL_DATABASE` - 数据库名称
- `JWT_SECRET_KEY` - JWT签名密钥
- `JWT_ALGORITHM` - JWT算法（默认HS256）
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` - JWT令牌有效期（分钟）
- `MINIO_ROOT_USER` - MinIO用户名
- `MINIO_ROOT_PASSWORD` - MinIO密码
- `MINIO_BUCKET_NAME` - MinIO存储桶名称

## API路由

- `GET /health` - 健康检查
- `POST /api/v1/auth/register` - 用户注册（后续开发）
- `POST /api/v1/auth/login` - 用户登录（后续开发）
- `PUT /api/v1/auth/password` - 修改密码（后续开发）