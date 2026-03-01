const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const FileWriter = require('fs');

// 创建日志文件
const logStream = fs.createWriteStream(path.join(__dirname, 'debug.log'), { flags: 'a' });

// 覆盖 console.error 同时输出到文件和终端
const originalError = console.error;
console.error = (...args) => {
  originalError.apply(console, args);
  logStream.write(`[${new Date().toISOString()}] ERROR: ${args.join(' ')}\n`);
};
const originalLog = console.log;
console.log = (...args) => {
  originalLog.apply(console, args);
  logStream.write(`[${new Date().toISOString()}] INFO: ${args.join(' ')}\n`);
};

const app = express();
// 使用环境变量中的端口，本地开发使用 3001
const port = process.env.PORT || 3001;

// 配置 CORS - 允许所有来源访问（生产环境应该限制为前端域名）
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 静态文件服务 - 用于提供图片访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB限制
  }
});

// 导入分析器
const literatureAnalyzer = require('./src/analyzers/llmAnalyzer');

// 缓存机制
const analysisCache = new Map();
const CACHE_TTL = 3600000; // 1小时缓存

// 生成文件哈希值作为缓存键
function generateFileHash(filePath) {
  const fileContent = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileContent).digest('hex');
}

// 分析接口
app.post('/analyze', upload.fields([{ name: 'literature' }, { name: 'image' }, { name: 'model' }]), async (req, res) => {
  try {
    console.error('################################################');
    console.error('### API /analyze 被调用了！ ###');
    console.error('################################################');
    
    if (!req.files || !req.files.literature) {
      return res.status(400).json({ error: '请上传文献文件' });
    }

    const literaturePath = req.files.literature[0].path;
    const imagePath = req.files.image ? req.files.image[0].path : null;
    const selectedModel = req.body.model || 'deepseek-v3.2';
    const apiKey = req.body.apiKey;
    const baseUrl = req.body.baseUrl || 'https://apis.iflow.cn/v1';

    console.error('文献路径:', literaturePath);
    console.error('图片路径:', imagePath);
    console.log('选择的模型:', selectedModel);
    console.log('Base URL:', baseUrl);
    console.log('API Key已提供:', apiKey ? '是' : '否');

    if (!apiKey) {
      return res.status(400).json({ error: '请提供API Key' });
    }

    if (!imagePath) {
      console.log('警告: 没有图片路径!');
    }

    // 设置分析器配置
    literatureAnalyzer.setConfig(apiKey, baseUrl, selectedModel);

    // 暂时完全禁用缓存，直接分析
    const fileHash = generateFileHash(literaturePath);
    const cacheKey = `${fileHash}_${selectedModel}`;
    // const cachedResult = analysisCache.get(cacheKey);
    // if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
    //   console.log('使用缓存结果');
    //   fs.unlinkSync(literaturePath);
    //   if (imagePath) {
    //     fs.unlinkSync(imagePath);
    //   }
    //   return res.json(cachedResult.data);
    // }

    // 设置超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('分析超时')), 600000); // 10分钟超时
    });

    // 分析文献
    console.log('=== 开始分析文献 ===');
    console.log('literaturePath:', literaturePath);
    console.log('imagePath:', imagePath);
    
    const analysisResult = await Promise.race([
      literatureAnalyzer.analyze(literaturePath, imagePath),
      timeoutPromise
    ]);
    
    console.log('=== 分析完成 ===');

    // 存储到缓存（暂时禁用）
    // analysisCache.set(cacheKey, {
    //   data: analysisResult,
    //   timestamp: Date.now()
    // });

    // 清理上传的文件
    fs.unlinkSync(literaturePath);
    if (imagePath) {
      fs.unlinkSync(imagePath);
    }

    res.json(analysisResult);
  } catch (error) {
    console.error('分析错误:', error);
    console.error('错误堆栈:', error.stack);
    // 清理上传的文件
    if (req.files && req.files.literature) {
      try {
        fs.unlinkSync(req.files.literature[0].path);
      } catch (e) {}
    }
    if (req.files && req.files.image) {
      try {
        fs.unlinkSync(req.files.image[0].path);
      } catch (e) {}
    }
    res.status(500).json({ error: error.message || '分析失败，请重试' });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${port}`);
  console.log(`生产环境：${process.env.NODE_ENV === 'production' ? '是' : '否'}`);
  if (process.env.FRONTEND_URL) {
    console.log(`前端 URL: ${process.env.FRONTEND_URL}`);
  }
});