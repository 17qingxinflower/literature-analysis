# Literature Analysis Tool

A powerful AI-powered literature analysis tool that automatically generates structured research reports from academic papers.

[🇨🇳 中文版本](README_zh.md) | [🌐 English Version](README.md)

## 🌟 Features

- **🤖 AI-Powered Analysis**: Automatically analyze academic papers using advanced LLM models
- **📊 Structured Reports**: Generate comprehensive reports including basic info, content analysis, conclusions, and limitations
- **🎨 Method Flowchart**: Generate professional AI image generation prompts for method flowcharts (top-tier journal style)
- **📥 Multi-format Support**: Support PDF, DOCX, TXT documents
- **🖼️ Image Analysis**: Optional upload of method diagram reference images
- **🌍 Multi-model**: Support multiple AI models (DeepSeek, GLM, Qwen, Kimi, etc.)
- **💾 Persistent Configuration**: API Key automatically saved locally
- **🔄 Continuous Analysis**: Upload multiple papers without losing configuration
- **📤 Download Reports**: Download analysis reports in Markdown format

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- iFlow API Key (get from https://platform.iflow.cn)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/17qingxinflower/literature-analysis.git
cd literature-analysis
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Start the application**
```bash
# Start backend server (in backend directory)
node index.js

# Start frontend (in another terminal, in frontend directory)
npm start
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📖 Usage

1. **Configure API Key**
   - Click "配置" (Settings) button
   - Enter your iFlow API Key
   - Base URL: `https://apis.iflow.cn/v1`
   - Click "Save"

2. **Upload Paper**
   - Upload PDF/DOCX/TXT document
   - (Optional) Upload method flowchart reference image

3. **Select AI Model**
   - Recommended: DeepSeek V3.2
   - Other options: GLM-4, Qwen, Kimi, etc.

4. **Start Analysis**
   - Click "开始分析" (Start Analysis)
   - Wait for analysis to complete (1-3 minutes)

5. **View & Download Report**
   - View structured analysis report
   - Click "下载报告" to download Markdown file

6. **Upload Another Paper**
   - Click "再次上传" (Upload Again)
   - Upload new paper (API Key retained)

## 🛠️ Deployment

### Deploy to Public Access

#### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Deploy Backend to Railway
- Visit: https://railway.app
- Create new project from GitHub repo
- Set Root Directory: `backend`
- Set Start Command: `node index.js`
- Add Environment Variable: `NODE_ENV=production`
- Copy generated domain

#### 3. Deploy Frontend to Vercel
- Visit: https://vercel.com
- Import GitHub repository
- Set Root Directory: `frontend`
- Add Environment Variable:
  ```
  REACT_APP_API_URL=https://your-backend.up.railway.app
  ```
- Deploy

#### 4. Access Your Site
- Vercel provides: `https://your-app.vercel.app`
- Share with anyone worldwide!

## 📁 Project Structure

```
literature-analysis/
├── backend/                # Backend server
│   ├── index.js           # Main server file
│   ├── src/
│   │   └── analyzers/
│   │       └── llmAnalyzer.js  # LLM analysis logic
│   └── package.json
├── frontend/              # Frontend React app
│   ├── src/
│   │   ├── App.js        # Main component
│   │   └── flowstyle.css # Styles
│   └── package.json
├── README.md             # English documentation
└── README_zh.md          # Chinese documentation
```

## 🔧 Configuration

### Backend Configuration
- Port: 3001 (default)
- CORS: Enabled for all origins
- File upload limit: 50MB

### Frontend Configuration
- API URL: Configurable in settings
- Models: Pre-configured list of iFlow models
- Storage: API Key saved to localStorage

## 🎯 Supported Models

### DeepSeek Series
- deepseek-v3.2 (Recommended)
- deepseek-v3
- deepseek-r1 (Reasoning)

### GLM Series (Zhipu)
- glm-4.6, glm-4-flash, glm-4-plus
- glm-4v-flash (Vision)
- glm-z1-flash (Reasoning)

### Qwen Series (Alibaba)
- qwen3-coder, qwen3-max
- qwen-turbo, qwen-plus, qwen-max

### Kimi Series (Moonshot)
- kimi-k2, kimi-k1-8k, kimi-latest

### Doubao Series (ByteDance)
- doubao-1-5-pro-32k, doubao-1-5-pro-256k

### Hunyuan Series (Tencent)
- hunyuan-lite, hunyuan-standard, hunyuan-pro, hunyuan-turbo

## 📊 Report Structure

### 1. Basic Information
- Title (Original & Chinese)
- Keywords
- Publication Year, Journal, Authors
- DOI, Source Code Info

### 2. Content Analysis
- Research Background
- Technical Methods
- Experimental Setup
- Results & Analysis

### 3. Conclusions & Limitations
- Core Conclusions (Chinese only)
- Limitations
- Future Work

### 4. Method Flowchart Prompt
- Professional AI image generation prompt
- Top-tier journal style (IEEE/Nature/Science)
- Detailed technical specifications
- All text in Chinese, prompt in English

## 🆘 Troubleshooting

### Common Issues

**Q: API Key invalid?**
A: Check your API Key at https://platform.iflow.cn

**Q: Analysis failed?**
A: Check network connection and API Key balance

**Q: File upload failed?**
A: Ensure file size < 50MB, supported format

**Q: Deployment failed?**
A: Check Railway/Vercel logs for errors

## 📝 Development

### Local Development

```bash
# Backend (Terminal 1)
cd backend
node index.js

# Frontend (Terminal 2)
cd frontend
npm start
```

### Build for Production

```bash
cd frontend
npm run build
```

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📧 Contact

- GitHub: https://github.com/17qingxinflower/literature-analysis
- Issues: https://github.com/17qingxinflower/literature-analysis/issues

## 🙏 Acknowledgments

- Powered by iFlow API (https://platform.iflow.cn)
- Built with React & Node.js
- Deployed on Vercel & Railway

---

**Made with ❤️ for researchers worldwide**
