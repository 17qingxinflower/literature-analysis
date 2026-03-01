# 📚 文献分析网站 - 部署指南

> 让知识随心流动 - 基于 AI 的学术文献自动分析工具

## 📖 项目简介

这是一个基于 React + Node.js 的文献分析网站，可以：
- 📄 上传 PDF/DOCX/TXT 格式的学术文献
- 🤖 使用 AI 自动分析文献内容
- 📊 生成结构化的分析报告
- 🎨 支持上传流程图参考图片
- 💾 下载 Markdown 格式的分析报告

## 🚀 快速部署

### 方式一：10 分钟快速部署（推荐）

适合想要快速上线的用户，请查看：[QUICK_START.md](QUICK_START.md)

**步骤概览**：
1. 初始化 Git 并推送到 GitHub
2. 部署后端到 Railway（4 分钟）
3. 部署前端到 Vercel（4 分钟）
4. 测试功能（1 分钟）

### 方式二：详细部署

适合需要详细了解每个步骤的用户，请查看：[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**支持多种方案**：
- 方案一：Vercel + Railway ⭐ 推荐
- 方案二：Netlify + Render
- 方案三：单平台部署

## 📋 部署检查清单

确保所有步骤都正确完成，请查看：[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## 🛠️ 本地工具

项目包含以下辅助脚本：

### Windows 用户

| 脚本 | 功能 | 说明 |
|------|------|------|
| `init-git.bat` | Git 初始化 | 自动初始化 Git 仓库 |
| `build-frontend.bat` | 前端构建 | 构建前端生产版本 |
| `test-local.bat` | 本地测试 | 测试本地前后端连接 |

### macOS/Linux 用户

```bash
# Git 初始化
git init
git add .
git commit -m "Initial commit"

# 前端构建
cd frontend && npm install && npm run build

# 本地测试
# 手动启动后端：cd backend && node index.js
# 手动启动前端：cd frontend && npm start
```

## 📦 技术栈

### 前端
- React 18
- Ant Design
- Framer Motion
- Axios

### 后端
- Node.js + Express
- PDF 解析（pdf-parse, mammoth）
- AI 集成（支持多个大模型）
- 文件处理（multer, fs-extra）

### 部署平台
- **前端**: Vercel / Netlify
- **后端**: Railway / Render

## 🔧 环境变量配置

### 后端环境变量

```bash
# 端口号（云平台通常自动设置）
PORT=3001

# 前端 URL（用于 CORS）
FRONTEND_URL=https://your-frontend.vercel.app

# Node 环境
NODE_ENV=production
```

### 前端环境变量

```bash
# 后端 API 地址
REACT_APP_API_URL=https://your-backend.up.railway.app
```

## 📝 部署步骤摘要

### 1. 准备代码

```bash
# 在项目根目录
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/你的用户名/literature-analysis.git
git branch -M main
git push -u origin main
```

### 2. 部署后端（Railway）

1. 访问 https://railway.app 并登录
2. New Project → Deploy from GitHub
3. 选择仓库，设置 Root Directory 为 `backend`
4. 添加环境变量：`NODE_ENV=production`
5. 等待部署完成，复制生成的域名

### 3. 部署前端（Vercel）

1. 访问 https://vercel.com 并登录
2. Add New → Project → 导入 GitHub 仓库
3. 设置 Root Directory 为 `frontend`
4. 添加环境变量：`REACT_APP_API_URL=后端域名`
5. 点击 Deploy

### 4. 测试

访问 Vercel 提供的域名，配置 API Key 并测试功能。

## 🌐 自定义域名

### Vercel 配置

1. Settings → Domains
2. 添加你的域名
3. 按提示配置 DNS

### Railway 配置

1. Settings → Domains
2. 添加自定义域名
3. 配置 DNS 记录

## 🔒 安全建议

1. **CORS 配置**: 限制为前端域名
2. **文件上传**: 限制大小和类型
3. **API Key**: 由用户提供，不存储在服务端
4. **环境变量**: 不要提交到代码仓库

## 💰 成本估算

### 免费套餐

| 平台 | 免费额度 | 是否够用 |
|------|---------|---------|
| Vercel | 100GB 带宽/月 | ✅ 足够 |
| Railway | $5 额度/月 | ✅ 足够 |

### 付费选项

- 域名：¥50-100/年
- Vercel Pro: $20/月（可选）
- Railway: 按使用量，约 ¥20-50/月

## ❓ 常见问题

### Q: 前端无法连接后端？

**A**: 检查前端的 `REACT_APP_API_URL` 环境变量是否正确设置为后端域名。

### Q: 部署后访问 404？

**A**: 
- 前端：检查构建是否成功
- 后端：检查 Railway 部署日志

### Q: 文件上传失败？

**A**: 检查文件大小是否超过限制，Railway 免费套餐有内存限制。

### Q: API 调用超时？

**A**: AI 分析需要时间，Railway 和 Vercel 都有超时限制，建议优化后端代码。

## 📞 获取帮助

- 📖 详细教程：[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- ✅ 检查清单：[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- ⚡ 快速开始：[QUICK_START.md](QUICK_START.md)

## 🎯 后续优化

1. **添加用户系统**: 使用 Auth0、Clerk
2. **数据库支持**: 使用 Supabase、PlanetScale
3. **文件存储**: 使用 AWS S3、Cloudinary
4. **监控系统**: 使用 Sentry、LogRocket
5. **性能优化**: 使用 Redis 缓存

## 📄 许可证

本项目仅供学习和研究使用。

---

**祝你部署顺利！🚀**

如有问题，请查看相关文档或搜索技术社区。
