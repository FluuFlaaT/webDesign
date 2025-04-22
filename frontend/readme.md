# 文章及用户管理系统 - 前端

这是文章及用户管理系统的前端部分，基于React和Ant Design构建。

## 技术栈

- React 18
- Ant Design 5
- React Router v6
- Axios
- ECharts (数据可视化)

## 目录结构

```
frontend/
├── public/           # 静态资源
├── src/              # 源代码
│   ├── api/          # API请求封装（后续添加）
│   ├── assets/       # 图片等资源（后续添加）
│   ├── components/   # 可复用组件（后续添加）
│   ├── contexts/     # React上下文（后续添加）
│   ├── hooks/        # 自定义钩子（后续添加）
│   ├── pages/        # 页面组件（后续添加）
│   ├── styles/       # 全局样式（后续添加）
│   ├── utils/        # 工具函数（后续添加）
│   ├── App.js        # 应用主组件
│   ├── App.css       # 应用样式
│   ├── index.js      # 入口文件
│   └── index.css     # 全局样式
├── .env              # 环境变量
├── package.json      # 依赖配置
└── Dockerfile        # Docker构建文件
```

## 本地开发

### 环境准备

1. 安装Node.js 16+
2. 安装依赖
   ```bash
   npm install
   # 或
   yarn
   ```

### 运行开发服务器

```bash
npm start
# 或
yarn start
```

访问 http://localhost:3000 查看应用。

## 构建部署

### 本地构建
```bash
npm run build
# 或
yarn build
```

### Docker部署

在项目根目录使用Docker Compose启动前端服务：

```bash
docker compose up frontend
```

## 功能模块

- **认证模块**：注册、登录、修改密码
- **用户信息**：用户基本信息卡片
- **联系人管理**：联系人列表、增删改查、搜索
- **文章管理**：
  - 作者统计：作者列表及文章数量统计图表
  - 文章详情：文章CRUD操作
- **主题切换**：蓝色和黄色主题切换
- **全局导航**：首页、功能菜单、主题切换、注销按钮

## 环境变量

- `REACT_APP_API_BASE_URL` - 后端API基础URL
- `REACT_APP_MINIO_BASE_URL` - MinIO/S3对象存储基础URL