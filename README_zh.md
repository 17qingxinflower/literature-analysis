# 文献分析工具

一个强大的 AI 驱动文献分析工具，可自动生成学术论文的结构化研究报告。

[🇨🇳 中文版本](README_zh.md) | [🌐 English Version](README.md)

## 🌟 功能特性

- **🤖 AI 智能分析**：使用先进的大语言模型自动分析学术论文
- **📊 结构化报告**：生成包含基础信息、内容分析、结论和局限性的完整报告
- **🎨 方法流程图**：生成专业的方法流程图 AI 图像生成提示词（顶级期刊风格）
- **📥 多格式支持**：支持 PDF、DOCX、TXT 文档
- **🖼️ 图片分析**：可选上传方法流程图参考图片
- **🌍 多模型支持**：支持多种 AI 模型（DeepSeek、智谱 GLM、通义千问、Kimi 等）
- **💾 配置持久化**：API Key 自动保存到本地
- **🔄 连续分析**：可连续上传多篇文献，配置不丢失
- **📤 下载报告**：支持下载 Markdown 格式分析报告

## 🚀 快速开始

### 前置要求

- Node.js 16+ 和 npm
- 心流 API Key（从 https://platform.iflow.cn 获取）

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/17qingxinflower/literature-analysis.git
cd literature-analysis
```

2. **安装依赖**
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

3. **启动应用**
```bash
# 启动后端服务器（在 backend 目录）
node index.js

# 启动前端（在另一个终端，frontend 目录）
npm start
```

4. **访问应用**
- 前端：http://localhost:3000
- 后端：http://localhost:3001

## 📖 使用说明

1. **配置 API Key**
   - 点击右上角"配置"按钮
   - 输入您的心流 API Key
   - Base URL: `https://apis.iflow.cn/v1`
   - 点击"保存"

2. **上传文献**
   - 上传 PDF/DOCX/TXT 文档
   - （可选）上传方法流程图参考图片

3. **选择 AI 模型**
   - 推荐：DeepSeek V3.2
   - 其他选项：智谱 GLM、通义千问、Kimi 等

4. **开始分析**
   - 点击"开始分析"按钮
   - 等待分析完成（1-3 分钟）

5. **查看和下载报告**
   - 查看结构化分析报告
   - 点击"下载报告"下载 Markdown 文件

6. **再次上传**
   - 点击"再次上传"按钮
   - 上传新文献（API Key 保留）

## 🛠️ 部署

### 部署到公网访问

#### 1. 推送到 GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. 部署后端到 Railway
- 访问：https://railway.app
- 从 GitHub 仓库创建新项目
- 设置 Root Directory: `backend`
- 设置 Start Command: `node index.js`
- 添加环境变量：`NODE_ENV=production`
- 复制生成的域名

#### 3. 部署前端到 Vercel
- 访问：https://vercel.com
- 导入 GitHub 仓库
- 设置 Root Directory: `frontend`
- 添加环境变量：
  ```
  REACT_APP_API_URL=https://你的后端域名.up.railway.app
  ```
- 点击"Deploy"

#### 4. 访问您的网站
- Vercel 提供：`https://your-app.vercel.app`
- 分享给全世界任何人访问！

## 📁 项目结构

```
literature-analysis/
├── backend/                # 后端服务器
│   ├── index.js           # 主服务器文件
│   ├── src/
│   │   └── analyzers/
│   │       └── llmAnalyzer.js  # LLM 分析逻辑
│   └── package.json
├── frontend/              # 前端 React 应用
│   ├── src/
│   │   ├── App.js        # 主组件
│   │   └── flowstyle.css # 样式文件
│   └── package.json
├── README.md             # 英文文档
└── README_zh.md          # 中文文档
```

## 🔧 配置说明

### 后端配置
- 端口：3001（默认）
- CORS：允许所有来源
- 文件上传限制：50MB

### 前端配置
- API 地址：可在设置中配置
- 模型列表：预配置的心流平台模型
- 存储：API Key 保存到 localStorage

## 🎯 支持的 AI 模型

### DeepSeek 系列
- deepseek-v3.2（推荐）
- deepseek-v3
- deepseek-r1（推理）

### 智谱 GLM 系列
- glm-4.6, glm-4-flash, glm-4-plus
- glm-4v-flash（视觉）
- glm-z1-flash（推理）

### 通义千问系列（阿里）
- qwen3-coder, qwen3-max
- qwen-turbo, qwen-plus, qwen-max

### Kimi 系列（月之暗面）
- kimi-k2, kimi-k1-8k, kimi-latest

### 豆包系列（字节）
- doubao-1-5-pro-32k, doubao-1-5-pro-256k

### 腾讯混元系列
- hunyuan-lite, hunyuan-standard, hunyuan-pro, hunyuan-turbo

## 📊 报告结构

### 1. 基础信息
- 标题（原文 + 中文译名）
- 关键词
- 发表年份、期刊、作者
- DOI、源码信息

### 2. 内容分析
- 研究背景
- 技术方法
- 实验设置
- 结果与分析

### 3. 结论与局限
- 核心结论（仅中文）
- 局限性
- 未来研究方向

### 4. 方法流程图提示词
- 专业 AI 图像生成提示词
- 顶级期刊风格（IEEE/Nature/Science）
- 详细技术规格
- 提示词全英文，图内文字中文

## 🆘 常见问题

### 问题排查

**Q: API Key 无效？**
A: 请在 https://platform.iflow.cn 检查您的 API Key

**Q: 分析失败？**
A: 检查网络连接和 API Key 余额

**Q: 文件上传失败？**
A: 确保文件大小 < 50MB，格式正确

**Q: 部署失败？**
A: 查看 Railway/Vercel 日志中的错误信息

## 📝 开发指南

### 本地开发

```bash
# 后端（终端 1）
cd backend
node index.js

# 前端（终端 2）
cd frontend
npm start
```

### 生产环境构建

```bash
cd frontend
npm run build
```

## 📄 许可证

MIT License

## 🤝 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📧 联系方式

- GitHub: https://github.com/17qingxinflower/literature-analysis
- 问题反馈：https://github.com/17qingxinflower/literature-analysis/issues

## 🙏 致谢

- 由心流 API 提供支持 (https://platform.iflow.cn)
- 使用 React & Node.js 构建
- 部署在 Vercel & Railway

---

**为全球科研人员用心打造 ❤️**
