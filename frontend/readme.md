# 文章及用户管理系统 - 前端

React 18、Ant Design、React Router 7、ECharts 6，使用 Vite 构建。Node.js 20.19+ 或 22.12+；云环境使用 Node.js 24。

## 目录结构

- `index.html`：应用 HTML 入口。
- `vite.config.js`：开发代理和构建配置。
- `src/index.jsx`、`src/App.jsx`：React 入口和路由。
- `src/components/`、`src/pages/`、`src/context/`：JSX 组件、页面、认证上下文。
- `src/services/api.js`：API 调用。
- `package-lock.json`：提交的依赖锁文件。

## 本地开发

```bash
cd frontend
npm ci
npm start
npm run build
```

开发服务使用根目录 `.env` 中的 `FRONTEND_PORT`（默认 3000）。构建输出为 `build/`。所有开发任务使用现有仓库；无需创建 Git worktree。

配置项：`VITE_API_URL`（默认 `/api/v1`）、`API_PROXY_TARGET`（默认 `http://127.0.0.1:8000`）。Vite 开发服务代理 `/api` 到后端；部署构建产物时需由 Nginx 等服务器提供同源 API 代理。只有 `VITE_` 前缀变量会注入浏览器，禁止使用该前缀保存密钥。

生日找回密码已停用，忘记密码时需管理员核实身份。修改密码仍需原密码，成功后退出所有已有会话。详见 `../docs/CHANGE_LOG.md`。

## Docker

`docker compose up frontend` 使用 Node.js 24 和 `npm ci`。完整 Compose 还依赖可用的 MySQL 和 MinIO 镜像；当前云环境的 MinIO 通过官方源码构建、在宿主机启动，不能假设完整 Compose 已验证。
