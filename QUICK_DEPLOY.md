# 🚀 15 分钟快速部署指南

## 让所有人都能访问您的文献分析网站

---

## 📋 步骤总览

1. ✅ 推送到 GitHub（3 分钟）
2. ✅ 部署后端到 Railway（5 分钟）
3. ✅ 部署前端到 Vercel（5 分钟）
4. ✅ 测试访问（2 分钟）

---

## 步骤 1️⃣：推送到 GitHub（3 分钟）

### 方法 A：使用自动化脚本（推荐）

1. **双击运行**桌面上的 `setup-git.bat` 文件

2. **访问 GitHub**：
   - 打开 https://github.com/new
   - 仓库名：`literature-analysis`
   - 设为 **Public**（公开）
   - 点击 "Create repository"

3. **复制推送命令**并执行：
   ```bash
   git remote add origin https://github.com/17qingxinflower/literature-analysis.git
   git branch -M main
   git push -u origin main
   ```

### 方法 B：手动执行

在项目根目录打开命令行，依次执行：

```bash
# 1. 初始化 Git
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "Initial commit: 文献分析工具"

# 4. 创建 GitHub 仓库后，添加远程仓库
git remote add origin https://github.com/17qingxinflower/literature-analysis.git

# 5. 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 步骤 2️⃣：部署后端到 Railway（5 分钟）

### 1. 访问 Railway

- 打开 https://railway.app
- 点击 **"Login"** → **"Sign in with GitHub"**
- 授权登录

### 2. 创建新项目

- 点击 **"New Project"**
- 选择 **"Deploy from GitHub repo"**
- 选择你的 `literature-analysis` 仓库

### 3. 配置后端服务

- 点击 **"Add Service"** → **"GitHub Repo"**
- 选择你的仓库
- **重要配置**：
  - **Root Directory**: `backend`
  - **Start Command**: `node index.js`

### 4. 添加环境变量

点击 **"Variables"** 标签，添加：

```
NODE_ENV=production
```

### 5. 等待部署

- 部署过程约 2-3 分钟
- 看到绿色 ✅ 表示部署成功
- **复制生成的域名**，格式类似：
  ```
  https://your-app.up.railway.app
  ```

---

## 步骤 3️⃣：部署前端到 Vercel（5 分钟）

### 1. 访问 Vercel

- 打开 https://vercel.com
- 点击 **"Sign Up"** → **"Continue with GitHub"**
- 授权登录

### 2. 导入项目

- 点击 **"Add New..."** → **"Project"**
- 找到你的 `literature-analysis` 仓库
- 点击 **"Import"**

### 3. 配置前端

- **Root Directory**: `frontend`
- **Framework Preset**: `Create React App`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### 4. 添加环境变量

点击 **"Environment Variables"**，添加：

```
REACT_APP_API_URL=https://你的后端域名.up.railway.app
```

**注意**：将 `你的后端域名` 替换为 Railway 生成的实际域名

### 5. 部署

- 点击 **"Deploy"**
- 等待 2-3 分钟
- 看到 **"Ready"** 表示部署成功
- **复制生成的域名**，格式类似：
  ```
  https://literature-analysis.vercel.app
  ```

---

## 步骤 4️⃣：测试访问（2 分钟）

### 1. 访问网站

在浏览器打开 Vercel 域名：
```
https://literature-analysis.vercel.app
```

### 2. 配置 API Key

- 点击右上角 **"配置"** 按钮
- 输入你的心流 API Key
  - 获取地址：https://platform.iflow.cn
- Base URL: `https://apis.iflow.cn/v1`
- 点击 **"保存"**

### 3. 测试功能

- 上传一篇 PDF 文献
- 选择 AI 模型（推荐：DeepSeek V3.2）
- 点击 **"开始分析"**
- 等待分析报告生成
- 下载 Markdown 报告

---

## 🎉 完成！

现在全世界都可以访问您的文献分析网站了！

### 分享您的网站

将 Vercel 域名分享给任何人：
- ✅ 同事/同学
- ✅ 社交媒体
- ✅ 研究团队

---

## 💰 费用说明

| 服务 | 免费额度 | 说明 |
|------|---------|------|
| **GitHub** | 免费 | 完全免费 |
| **Vercel** | 100GB/月 | 个人使用足够 |
| **Railway** | $5/月 | 个人使用足够 |
| **总计** | **¥0** | 免费！ |

---

## 🔧 后续配置

### 自定义域名（可选）

如果想使用自己的域名（如 `literature-analysis.com`）：

**Vercel 配置**：
1. 进入项目设置
2. 点击 **"Domains"**
3. 添加你的域名
4. 按照提示配置 DNS

**Railway 配置**：
1. 进入项目设置
2. 点击 **"Networking"**
3. 添加自定义域名

### 监控使用情况

- **Vercel**: https://vercel.com/dashboard
- **Railway**: https://railway.app/dashboard

---

## 🆘 常见问题

### Q1: Railway 部署失败？
**A**: 查看日志，通常是环境变量配置错误

### Q2: Vercel 构建失败？
**A**: 检查 Root Directory 是否为 `frontend`

### Q3: API 调用失败？
**A**: 确保前端环境变量中的 API 地址正确

### Q4: 跨域错误？
**A**: 后端已配置 CORS，通常不会有问题

---

## 📚 更多资源

- [完整部署文档](DEPLOYMENT_GUIDE.md)
- [检查清单](DEPLOYMENT_CHECKLIST.md)
- [文件说明](DEPLOYMENT_FILES.md)

---

**祝您部署顺利！🚀**

如有问题，请查看项目目录中的详细文档。
