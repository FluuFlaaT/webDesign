# 文章及用户管理系统 - 后端

FastAPI、SQLAlchemy 2、Pydantic 2、PyMySQL、PyJWT、bcrypt、Boto3 和 Pillow。使用 Python 3.11+。

## 目录结构

`main.py` 为应用入口；`database.py`、`models.py`、`schemas.py` 提供数据库和数据模型；`auth.py` 提供密码和 JWT 校验；`routers/` 包含认证、用户、联系人和文章接口；`tests/` 包含安全回归测试。

## 本地开发

```bash
cd backend
python3.11 -m venv venv
venv/bin/pip install -r requirements-dev.txt
venv/bin/pytest tests -q
venv/bin/uvicorn main:app --reload
```

配置可放在根目录或后端目录的忽略文件 `.env`。复制 `.env.example` 后，生成至少 32 字节的随机 `SECRET_KEY`；应用拒绝空值及示例密钥：

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

请将输出仅保存在本地配置或安全环境设置，勿提交。云环境中已有的本地随机密钥可复用；不要复制到聊天或配置脚本文本。

必需服务为 MySQL 和 S3/MinIO。使用宿主机服务时配置 `MYSQL_HOST=127.0.0.1` 和 `S3_ENDPOINT_URL=http://127.0.0.1:9000`。主要配置名见 `.env.example`：`DATABASE_URL` 或 `MYSQL_*`、`SECRET_KEY`、`ACCESS_TOKEN_EXPIRE_MINUTES`、`S3_*`、`CORS_ORIGINS`、`MAX_UPLOAD_BYTES`、`MAX_REQUEST_BYTES`、`MAX_AVATAR_PIXELS`。

云平台的 AWS 身份占位配置可能让 Boto3 抛出 ProfileNotFound；本地 MinIO 使用显式 S3 凭据，可在该进程启动时运行 `env -u AWS_PROFILE -u AWS_DEFAULT_PROFILE ...`，无需平台 AWS 凭据。不要打印环境变量值。

## 安全行为

- `/health` 返回服务状态；还须确认启动日志中的数据库初始化成功。
- 注册、登录和验证原密码的修改密码可用；生日验证和未验证身份的密码重置返回 410。未来自助找回必须实现可信的身份验证，不能以公开生日作为凭证。
- 改密使已有 JWT 失效；JWT 必须包含有效的过期时间、用途、用户名和当前密码版本。
- 用户仅能修改邮箱和生日；余额不可由个人资料接口更改。
- 头像支持 PNG/JPEG/WebP，会重新编码成 PNG；默认文件上限 5 MiB、请求上限 6 MiB、像素上限 1600 万。
- 测试使用内存 SQLite，不连接开发数据库；真实 MySQL/MinIO 的功能还需集成验证。

Docker 使用 Python 3.11。生产部署应提供独立随机密钥、服务凭据、可信的 CORS 来源，并配置同源 API 代理；仓库示例中的 MySQL/MinIO 密码只用于本地开发。
