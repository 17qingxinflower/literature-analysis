# 🚀 快速开始 - 10 分钟部署指南

如果你时间紧张，这是最快的部署方案。

## ⏱️ 10 分钟快速部署

### 前提条件（2 分钟）

1. **安装 Git**（如果已安装可跳过）
   - 访问 https://git-scm.com/
   - 下载并安装

2. **准备代码**
   ```bash
   # 在项目根目录执行
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 创建仓库 `literature-analysis`
   - 按提示推送代码

### 部署后端到 Railway（4 分钟）

1. **注册并登录**
   - 访问 https://railway.app
   - 使用 GitHub 登录

2. **创建项目**
   - 点击"New Project"
   - 选择"Deploy from GitHub repo"
   - 选择 `literature-analysis` 仓库

3. **配置 Backend**
   - Railway 会自动识别，但需要指定目录
   - 在 Settings 中设置：
     - Root Directory: `backend`
   - 添加环境变量：
     ```
     NODE_ENV=production
     ```

4. **等待部署**
   - Railway 会自动构建和部署
   - 部署成功后复制域名（如：`https://xxx.up.railway.app`）

### 部署前端到 Vercel（4 分钟）

1. **注册并登录**
   - 访问 https://vercel.com
   - 使用 GitHub 登录

2. **导入项目**
   - 点击"Add New..." → "Project"
   - 选择 `literature-analysis` 仓库

3. **配置 Frontend**
   - Root Directory: 点击 Edit，选择 `frontend`
   - Framework Preset: Create React App
   - 添加环境变量：
     ```
     REACT_APP_API_URL=https://你的后端域名.up.railway.app
     ```
     （替换为 Railway 的域名）

4. **部署**
   - 点击"Deploy"
   - 等待 2-3 分钟

### 测试（1 分钟）

1. **访问网站**
   - 打开 Vercel 提供的域名

2. **配置 API Key**
   - 点击"配置"按钮
   - 输入你的心流 API Key

3. **测试功能**
   - 上传一个 PDF 文献
   - 点击"开始分析"
   - 等待分析完成

**完成！🎉**

---

## 🎯 一键部署脚本

### Windows 用户

双击运行 `init-git.bat`，然后按提示操作。

### 手动推送命令

```bash
# 在项目根目录执行
git remote add origin https://github.com/你的用户名/literature-analysis.git
git branch -M main
git push -u origin main
```

---

## 📱 移动端部署（不推荐）

理论上可以用手机部署，但非常不方便。建议使用电脑。

---

## ⚡ 更快的方案？

### 使用 Vercel 部署全栈（不推荐）

虽然 Vercel 也支持 Serverless Functions，但你的后端需要处理文件上传和大量计算，不适合使用 Serverless。

### 使用 Netlify 部署全栈（不推荐）

同上，Netlify Functions 也有类似的限制。

---

## 🆘 遇到问题？

### 快速排查

1. **后端部署失败**
   - 检查 Railway 的 Deploy Logs
   - 确认 `backend/package.json` 配置正确

2. **前端无法连接后端**
   - 检查环境变量 `REACT_APP_API_URL`
   - 确保后端域名正确

3. **API 调用失败**
   - 验证 API Key 是否正确
   - 检查 CORS 配置

### 快速解决方案

如果遇到问题，参考完整文档：
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 完整部署教程
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - 检查清单

---

## 💡 提示

- **免费额度**: Vercel 和 Railway 的免费套餐对个人使用足够
- **域名**: 可以先使用平台提供的免费域名，后期再配置自定义域名
- **监控**: 部署后定期检查服务状态

---

**祝你部署顺利！🚀**
