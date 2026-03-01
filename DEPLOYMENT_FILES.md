# 📦 部署文件清单

本文档列出了所有为部署创建的文件和配置。

## 🗂️ 文件结构

```
d:\LZJ\论文阅读\小工具\
│
├── 📄 README_DEPLOYMENT.md          # 部署总览文档
├── 📄 QUICK_START.md                # 快速开始指南（10 分钟）
├── 📄 DEPLOYMENT_GUIDE.md           # 详细部署教程
├── 📄 DEPLOYMENT_CHECKLIST.md       # 部署检查清单
├── 📄 DEPLOYMENT_FILES.md           # 本文件 - 文件清单
│
├── 🛠️ init-git.bat                  # Git 初始化脚本
├── 🛠️ build-frontend.bat            # 前端构建脚本
├── 🛠️ test-local.bat                # 本地测试脚本
│
├── .gitignore                       # Git 忽略文件配置
│
├── backend\
│   ├── .env.example                 # 后端环境变量示例
│   ├── railway.json                 # Railway 部署配置
│   ├── render.yaml                  # Render 部署配置
│   ├── vercel.json                  # Vercel 部署配置（备用）
│   └── package.json                 # 已更新（添加 engines 字段）
│
└── frontend\
    ├── .env.example                 # 前端环境变量示例
    └── vercel.json                  # Vercel 部署配置
```

## 📋 文件说明

### 文档文件

| 文件名 | 用途 | 推荐阅读顺序 |
|--------|------|-------------|
| `README_DEPLOYMENT.md` | 部署总览和快速参考 | 1️⃣ 首先阅读 |
| `QUICK_START.md` | 10 分钟快速部署指南 | 2️⃣ 快速部署 |
| `DEPLOYMENT_GUIDE.md` | 详细的部署教程 | 3️⃣ 深入了解 |
| `DEPLOYMENT_CHECKLIST.md` | 部署检查清单 | 4️⃣ 检查进度 |
| `DEPLOYMENT_FILES.md` | 文件清单（本文件） | 5️⃣ 了解配置 |

### 脚本文件

| 文件名 | 功能 | 使用场景 |
|--------|------|---------|
| `init-git.bat` | 自动初始化 Git 仓库 | 首次部署 |
| `build-frontend.bat` | 构建前端生产版本 | 本地测试 |
| `test-local.bat` | 测试本地前后端连接 | 开发调试 |

### 配置文件

#### 后端配置

| 文件名 | 用途 | 说明 |
|--------|------|------|
| `.env.example` | 环境变量模板 | 复制为 `.env` 使用 |
| `railway.json` | Railway 部署配置 | 自动识别使用 |
| `render.yaml` | Render 部署配置 | 自动识别使用 |
| `vercel.json` | Vercel 函数配置 | 备用方案 |
| `package.json` | Node.js 项目配置 | 已添加 engines 字段 |

#### 前端配置

| 文件名 | 用途 | 说明 |
|--------|------|------|
| `.env.example` | 环境变量模板 | 复制为 `.env` 使用 |
| `vercel.json` | Vercel 部署配置 | 自动识别使用 |

### 代码修改

#### 后端修改

**文件**: `backend/index.js`

**修改内容**:
1. 端口配置改为支持环境变量
2. CORS 配置增强，支持指定前端域名
3. 启动日志输出更多信息

**修改位置**:
- 第 24-30 行：端口和 CORS 配置
- 第 171-177 行：服务器启动

#### 前端修改

**文件**: `frontend/src/App.js`

**修改内容**:
- API 地址改为支持环境变量配置

**修改位置**:
- 第 115-117 行：API 地址配置

## 🔧 配置文件详解

### backend/railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**说明**: Railway 部署配置，指定启动命令和重启策略。

### backend/render.yaml

```yaml
services:
  - type: web
    name: literature-analysis-backend
    env: node
    buildCommand: npm install
    startCommand: node index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
    disk:
      name: uploads
      mountPath: /opt/render/project/src/uploads
      sizeGB: 1
```

**说明**: Render 部署配置，包含持久化存储配置。

### frontend/vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**说明**: Vercel 部署配置，支持 SPA 路由。

### .gitignore

```
# 依赖
node_modules/
package-lock.json

# 上传文件
uploads/
downloads/
temp/

# 日志
*.log
debug.log

# 环境变量
.env
.env.local
.env.production

# ... 更多配置见文件
```

**说明**: Git 忽略文件配置，防止敏感信息泄露。

## 🎯 使用指南

### 首次部署

1. 运行 `init-git.bat` 初始化 Git
2. 推送到 GitHub
3. 按照 `QUICK_START.md` 部署到 Railway 和 Vercel

### 本地开发

```bash
# 后端
cd backend
node index.js

# 前端（新终端）
cd frontend
npm start
```

### 构建测试

```bash
# 运行构建脚本
build-frontend.bat

# 或手动构建
cd frontend
npm run build
```

### 本地测试

```bash
# 运行测试脚本
test-local.bat

# 或手动测试
# 1. 启动后端：cd backend && node index.js
# 2. 启动前端：cd frontend && npm start
# 3. 访问 http://localhost:3000
```

## 📝 环境变量

### 后端环境变量示例

创建 `backend/.env` 文件：

```bash
# 端口号
PORT=3001

# 前端 URL（生产环境）
FRONTEND_URL=https://your-frontend.vercel.app

# Node 环境
NODE_ENV=production
```

### 前端环境变量示例

创建 `frontend/.env` 文件：

```bash
# 后端 API 地址
REACT_APP_API_URL=https://your-backend.up.railway.app
```

**注意**: `.env` 文件不会被提交到 Git，每个环境单独配置。

## 🔒 安全提示

以下文件包含敏感信息，不应提交到 Git：

- `.env`
- `.env.local`
- `.env.production`
- `backend/.env`
- `frontend/.env`

这些文件已添加到 `.gitignore`。

## 📊 部署平台对比

| 特性 | Vercel + Railway | Netlify + Render | 单平台 |
|------|-----------------|------------------|--------|
| 部署难度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 免费额度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 管理复杂度 | 中等 | 中等 | 简单 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🆘 故障排查

### 文件丢失？

检查 `.gitignore` 配置，确保重要文件未被忽略。

### 配置错误？

参考各平台的文档：
- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app)
- [Netlify 文档](https://docs.netlify.com)
- [Render 文档](https://render.com/docs)

### 部署失败？

1. 查看平台提供的构建日志
2. 检查 `package.json` 配置
3. 确认 Node.js 版本兼容性

## 📞 获取帮助

- 📖 详细教程：[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- ✅ 检查清单：[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- ⚡ 快速开始：[QUICK_START.md](QUICK_START.md)
- 📱 总览文档：[README_DEPLOYMENT.md](README_DEPLOYMENT.md)

---

**所有文件已准备就绪，祝你部署顺利！🚀**

最后更新：2026-03-01
