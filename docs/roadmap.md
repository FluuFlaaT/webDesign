## ‼️ 阶段性实施计划（建议 4 轮迭代，每轮 ≈ 1 周）

> 单人课程项目通常只有几周时间。下面按 **迭代‑递增** 思路，把任务拆成 4 个可交付的「最小可运行版本 (MRV)」。  
> 每轮 **先完成“必须交付”**, 再做“可选加分”。每轮结束都要：  
> 1. `git tag vX.Y` 归档代码 + Docker 运行截图  
> 2. 更新 `/frontend` & `/backend` README  
> 3. 5 分钟 Demo 向老师/同学汇报

| 迭代 | 时间 | 目标 & 可见成果 | 必须交付 | 可选加分 |
|------|------|----------------|----------|----------|
| **Sprint 0 — 环境就绪** | Day 1‑2 | *“我能在另一台空白电脑上 `docker compose up` 跑出 Hello World ‑FastAPI & React 页面。”* | - 安装 Node / Python / Docker<br>- 创建目录结构 & Git Repo<br>- `frontend`: CRA+AntD 启动页<br>- `backend`: FastAPI “/health” 路由<br>- `docker‑compose.yml` 带 MySQL & MinIO<br>- `.env.example` 模版 | - ESLint / Prettier<br>- Husky Git Hook<br>- VS Code DevContainer |
| **Sprint 1 — 用户 & 认证** | Day 3‑7 | *“注册 / 登录 / 修改密码三页真实可用；用户信息存进 MySQL；头像能上传到 MinIO 桶。”* | - 建表 `users`，字段见需求<br>- 密码加密 + JWT 登出/续签<br>- FastAPI 路由 `/auth/*`<br>- React 表单三页 + 路由守卫<br>- S3 上传 SDK 通了 (本地 MinIO) | - TDD：`pytest` 覆盖 `/auth`<br>- 登录成功自动跳转主页 |
| **Sprint 2 — 联系人管理** | Week 2 | *“登录后可增删改查联系人；列表分页；姓名模糊搜索。”* | - 表 `contacts` 与 ORM 模型<br>- REST 路由 `/contacts`<br>- React `ContactsPage`：<br>  ↳ AntD Table + Modal 编辑<br>- 前端封装 `axios`，JWT 拦截器 | - 地址自动补全（省/市）<br>- CSV 批量导入 |
| **Sprint 3 — 文章统计 & 管理 + 主题切换** | Week 3 | *“作者统计柱状图 + 文章 CRUD 页面；蓝/黄主题切换；侧栏导航完整。”* | - 表 `articles`<br>- 路由 `/stats` (作者文章数)<br>- 路由 `/articles` (分页搜索)<br>- `AuthorStatsPage` + eCharts<br>- `ArticleManagePage` + CRUD<br>- Ant Design Token 主题切换<br>- 左侧导航 + 注销按钮 | - Markdown 编辑器支持<br>- 图片拖拽上传到 S3 |
| **Sprint 4 — 部署 & 打磨** | Week 4 | *“一键部署包 + 用户手册；老师/助教可全流程体验。”* | - Nginx 反向代理配置<br>- 生产用 `.env.sample` 文档<br>- `docker compose --profiles prod` 模式<br>- 填写 `/docs/DEV_GUIDE.md`、常见问题<br>- Bug 列表清零 | - GitHub Actions 自动构建镜像<br>- 单元 + E2E 测试覆盖 60% |

### 迭代节奏示例（单人版）

```
Mon AM  需求细化 / 看板拆分
Mon PM‑Tue 一口气做后端接口
Wed‑Thu 前端页面 + 联调
Fri     编写 README / 录 Demo / 回顾
Sat‑Sun 预留缓冲、加分项
```

---

### 交付检查表（每轮结束自测）

- [ ] `docker compose up -d` 不报错，前后端能正常握手  
- [ ] README 中的“启动步骤”与实际一致  
- [ ] 每个主要功能至少点一次，日志无异常  
- [ ] Git Tag、截图、演示视频准备完毕  
- [ ] 下一轮任务已在 Kanban 上排好优先级

---

**温馨提示**

- 遇到卡点时，**先最小化复现**：把问题提炼成 10 行代码 / 最简单接口；能瞬间定位 90% bug。  
- 每迭代都是可运行的小版本，不要等到最后一次性集成。  
- 如果时间不够，删减“可选加分”，绝不牺牲“必须交付”。  

