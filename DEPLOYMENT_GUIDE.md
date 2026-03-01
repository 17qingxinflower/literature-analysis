# 📚 文献分析网站部署完整教程

## 🎯 目录

1. [部署方案选择](#部署方案选择)
2. [准备工作](#准备工作)
3. [方案一：Vercel + Railway（推荐）](#方案一 vercel--railway)
4. [方案二：Netlify + Render](#方案二 netlify--render)
5. [方案三：单平台部署](#方案三单平台部署)
6. [域名配置](#域名配置)
7. [常见问题](#常见问题)

---

## 📋 部署方案选择

### 推荐方案对比

| 方案 | 前端平台 | 后端平台 | 优点 | 缺点 | 推荐度 |
|------|---------|---------|------|------|--------|
| **方案一** | Vercel | Railway | 免费额度高、速度快、配置简单 | 需要管理两个服务 | ⭐⭐⭐⭐⭐ |
| **方案二** | Netlify | Render | 同样免费、部署简单 | Render 免费实例会休眠 | ⭐⭐⭐⭐ |
| **方案三** | Railway | Railway | 统一管理、只需一个服务 | 免费额度有限 | ⭐⭐⭐ |

### 为什么推荐 Vercel + Railway？

1. **Vercel**：
   - 专为 React/Vue 等前端框架优化
   - 自动构建和部署
   - 全球 CDN 加速
   - 免费套餐：100GB 带宽/月

2. **Railway**：
   - 支持 Node.js 后端
   - 自动识别并部署
   - 提供持久化存储
   - 免费套餐：$5 额度/月（足够个人使用）

---

## 🔧 准备工作

### 1. 安装 Git

如果还没有安装 Git，请前往 [https://git-scm.com/](https://git-scm.com/) 下载安装。

### 2. 创建 GitHub 账号

前往 [https://github.com](https://github.com) 注册账号（如果已有可跳过）。

### 3. 初始化 Git 仓库

在项目根目录（`d:\LZJ\论文阅读\小工具`）执行：

```bash
cd "d:\LZJ\论文阅读\小工具"
git init
git add .
git commit -m "Initial commit - 文献分析网站"
```

### 4. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名：`literature-analysis`
3. 设为公开仓库（Public）
4. 点击"Create repository"

### 5. 推送代码到 GitHub

```bash
git remote add origin https://github.com/你的用户名/literature-analysis.git
git branch -M main
git push -u origin main
```

---

## 🚀 方案一：Vercel + Railway（推荐）

### 第一部分：部署后端到 Railway

#### 步骤 1：注册 Railway

1. 访问 [https://railway.app](https://railway.app)
2. 点击"Start a New Project"
3. 使用 GitHub 账号登录

#### 步骤 2：创建新项目

1. 点击"New Project"
2. 选择"Deploy from GitHub repo"
3. 选择你的 `literature-analysis` 仓库

#### 步骤 3：配置后端服务

1. Railway 会自动识别项目，但我们需要指定部署 backend 目录
2. 在 Railway 面板中，点击"Variables"标签
3. 添加以下环境变量：
   ```
   NODE_ENV=production
   PORT=3001
   ```

#### 步骤 4：配置 Railway 使用 backend 目录

在 Railway 面板中，找到"Settings"，添加以下配置：

1. 点击"Generate"按钮生成一个域名
2. 复制生成的域名（类似 `https://xxx-production.up.railway.app`）
3. 保存这个域名，稍后前端配置需要用到

#### 步骤 5：等待部署完成

Railway 会自动：
- 安装依赖（`npm install`）
- 启动服务（`node index.js`）

部署完成后，你会看到绿色的"SUCCESS"标志。

#### 步骤 6：测试后端 API

访问：`https://你的域名.up.railway.app/health`

如果看到 `{"status":"ok"}`，说明部署成功！

---

### 第二部分：部署前端到 Vercel

#### 步骤 1：注册 Vercel

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击"Sign Up"
3. 使用 GitHub 账号登录

#### 步骤 2：导入项目

1. 点击"Add New..." → "Project"
2. 在"Import Git Repository"页面，找到你的 `literature-analysis` 仓库
3. 点击"Import"

#### 步骤 3：配置前端项目

1. **Framework Preset**: 选择 `Create React App`
2. **Root Directory**: 点击"Edit"，选择 `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`

#### 步骤 4：配置环境变量

在 Vercel 项目设置中，添加环境变量：

1. 点击"Environment Variables"
2. 添加：
   ```
   REACT_APP_API_URL=https://你的后端域名.up.railway.app
   ```
   （替换为 Railway 生成的后端域名）

#### 步骤 5：部署

1. 点击"Deploy"
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，你会获得一个域名（类似 `https://xxx.vercel.app`）

#### 步骤 6：测试网站

1. 访问 Vercel 提供的域名
2. 点击"配置"按钮
3. 输入你的 API Key（从心流开放平台获取）
4. 上传文献测试

---

### 第三部分：配置自定义域名（可选）

#### 在 Vercel 配置域名

1. 进入 Vercel 项目 → "Settings" → "Domains"
2. 输入你的域名（如 `literature-analysis.com`）
3. 点击"Add"
4. 按照提示配置 DNS 记录

#### 在 Railway 配置域名

1. 进入 Railway 项目 → "Settings" → "Domains"
2. 点击"Generate Domain"或添加自定义域名
3. 如果使用自定义域名，需要配置 DNS

---

## 📝 方案二：Netlify + Render

### 第一部分：部署后端到 Render

#### 步骤 1：注册 Render

1. 访问 [https://render.com](https://render.com)
2. 使用 GitHub 账号登录

#### 步骤 2：创建 Web Service

1. 点击"New +" → "Web Service"
2. 选择你的 GitHub 仓库
3. 配置以下选项：
   - **Name**: `literature-analysis-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

#### 步骤 3：配置环境变量

在 Render 面板中，点击"Environment"，添加：
```
NODE_ENV=production
PORT=3001
```

#### 步骤 4：部署

1. 点击"Create Web Service"
2. 等待部署完成
3. 复制生成的 URL（类似 `https://xxx.onrender.com`）

---

### 第二部分：部署前端到 Netlify

#### 步骤 1：注册 Netlify

1. 访问 [https://netlify.com](https://netlify.com)
2. 使用 GitHub 账号登录

#### 步骤 2：添加站点

1. 点击"Add new site" → "Import an existing project"
2. 选择 GitHub，授权 Netlify 访问
3. 选择你的 `literature-analysis` 仓库

#### 步骤 3：配置构建选项

1. **Base directory**: `frontend`
2. **Build command**: `npm run build`
3. **Publish directory**: `frontend/build`

#### 步骤 4：配置环境变量

点击"Environment variables"，添加：
```
REACT_APP_API_URL=https://你的后端域名.onrender.com
```

#### 步骤 5：部署

1. 点击"Deploy site"
2. 等待构建完成
3. 获得 Netlify 提供的域名（类似 `https://xxx.netlify.app`）

---

## 🎯 方案三：单平台部署（Railway）

### 将前后端一起部署到 Railway

#### 步骤 1：创建统一入口

在项目根目录创建 `railway-start.js`：

```javascript
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// API 代理
app.use('/analyze', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true
}));

app.use('/health', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true
}));

app.use('/uploads', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true
}));

// 静态文件服务（前端构建产物）
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// 所有其他请求返回前端 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
});
```

#### 步骤 2：修改 package.json

在项目根目录创建 `package.json`：

```json
{
  "name": "literature-analysis-monorepo",
  "version": "1.0.0",
  "scripts": {
    "start": "node railway-start.js",
    "build": "cd frontend && npm install && npm run build"
  },
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6"
  }
}
```

#### 步骤 3：配置 Railway

1. 在 Railway 中导入项目
2. 设置 Root Directory 为项目根目录
3. 配置环境变量

**注意**：此方案较复杂，不推荐新手使用。

---

## 🌐 域名配置

### 免费域名选项

1. **Freenom**（.tk, .ml, .ga 等）
   - 访问 https://www.freenom.com
   - 注册并搜索可用域名
   - 免费使用 1 年

2. **Eu.org**（永久免费）
   - 访问 https://nic.eu.org
   - 提交申请（审核约 1-2 周）

### 付费域名推荐

1. **Namecheap**: https://www.namecheap.com
2. **Cloudflare**: https://www.cloudflare.com
3. **阿里云万网**: https://wanwang.aliyun.com

### 配置 DNS

以 Vercel 为例：

1. 在 Vercel 项目设置中添加域名
2. 获得 DNS 配置要求：
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
3. 在域名注册商处配置 DNS
4. 等待 DNS 生效（几分钟到几小时不等）

---

## ❓ 常见问题

### Q1: 部署后前端无法连接后端？

**解决方案**：
1. 检查前端环境变量 `REACT_APP_API_URL` 是否正确
2. 确保后端 CORS 配置允许前端域名访问
3. 检查后端服务是否正常运行

### Q2: Railway 部署失败？

**解决方案**：
1. 查看 Railway 的 Deploy Logs
2. 确认 `package.json` 中的 `engines` 字段指定了 Node 版本
3. 检查是否有 `.env` 文件被错误提交

### Q3: 文件上传失败？

**解决方案**：
1. 云平台可能有文件大小限制
2. Railway 免费套餐有内存限制，大文件可能失败
3. 考虑使用云存储（如 AWS S3、Cloudinary）

### Q4: 访问速度慢？

**解决方案**：
1. 使用 Cloudflare CDN
2. 选择离用户最近的服务器区域
3. 优化前端构建（压缩图片、代码分割）

### Q5: API Key 安全吗？

**当前方案**：
- API Key 由前端用户提供，存储在浏览器本地
- 不会上传到你的服务器
- 相对安全

**改进方案**：
- 在后端存储 API Key
- 添加用户认证系统
- 使用环境变量存储敏感信息

---

## 🔒 安全建议

### 生产环境配置

1. **限制 CORS 来源**：
   ```javascript
   // backend/index.js
   app.use(cors({
     origin: 'https://your-frontend.vercel.app',
     credentials: true
   }));
   ```

2. **添加请求速率限制**：
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 分钟
     max: 100 // 最多 100 个请求
   });
   
   app.use('/analyze', limiter);
   ```

3. **文件上传大小限制**：
   ```javascript
   const upload = multer({
     storage: storage,
     limits: {
       fileSize: 10 * 1024 * 1024 // 10MB
     }
   });
   ```

---

## 📊 成本估算

### 免费套餐额度

| 平台 | 免费额度 | 是否够用 |
|------|---------|---------|
| Vercel | 100GB 带宽/月 | ✅ 个人使用足够 |
| Railway | $5 额度/月 | ✅ 个人使用足够 |
| Netlify | 100GB 带宽/月 | ✅ 个人使用足够 |
| Render | 750 小时/月 | ⚠️ 会休眠，但可用 |

### 如果使用付费

- **域名**: ¥50-100/年
- **Vercel Pro**: $20/月（如果需要更多功能）
- **Railway**: 按使用量计费，一般 ¥20-50/月

---

## 🎉 部署完成！

恭喜你完成部署！现在你可以：

1. 分享你的网站给朋友
2. 继续开发新功能
3. 监控网站运行情况
4. 根据用户反馈优化体验

### 后续优化建议

1. **添加用户系统**：使用 Auth0、Clerk 等
2. **数据库支持**：使用 Supabase、PlanetScale
3. **文件存储**：使用 AWS S3、Cloudinary
4. **监控系统**：使用 Sentry、LogRocket
5. **性能优化**：使用 Redis 缓存分析结果

---

## 📞 获取帮助

如果遇到问题：

1. 查看各平台的文档
2. 检查部署日志
3. 在 GitHub 提 Issue
4. 搜索相关技术社区

祝你部署顺利！🚀
