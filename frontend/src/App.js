import React, { useState } from 'react';
import { Button, message, Select, Space, Input, Modal, Alert, Spin, Tooltip } from 'antd';
import axios from 'axios';
import { FileTextOutlined, PictureOutlined, RobotOutlined, KeyOutlined, SettingOutlined, DownloadOutlined, CopyOutlined, LinkOutlined, ZoomInOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './flowstyle.css';

const { Option } = Select;
const { Password } = Input;

const models = [
  { value: 'deepseek-v3.2', label: 'DeepSeek V3.2 (推荐)' },
  { value: 'deepseek-v3', label: 'DeepSeek V3' },
  { value: 'deepseek-r1', label: 'DeepSeek R1 (推理)' },
  { value: 'glm-4.6', label: 'GLM-4.6 (智谱)' },
  { value: 'glm-4-flash', label: 'GLM-4-Flash (智谱)' },
  { value: 'glm-4-plus', label: 'GLM-4-Plus (智谱)' },
  { value: 'glm-4-air', label: 'GLM-4-Air (智谱)' },
  { value: 'glm-4-airx', label: 'GLM-4-AirX (智谱)' },
  { value: 'glm-4-long', label: 'GLM-4-Long (智谱)' },
  { value: 'glm-4v-flash', label: 'GLM-4V-Flash (视觉)' },
  { value: 'glm-4v-plus', label: 'GLM-4V-Plus (视觉)' },
  { value: 'glm-z1-flash', label: 'GLM-Z1-Flash (推理)' },
  { value: 'glm-z1-airx', label: 'GLM-Z1-AirX (推理)' },
  { value: 'glm-z1-air', label: 'GLM-Z1-Air (推理)' },
  { value: 'kimi-k2', label: 'Kimi K2 (月之暗面)' },
  { value: 'kimi-k1-8k', label: 'Kimi K1-8K (月之暗面)' },
  { value: 'kimi-latest', label: 'Kimi Latest (月之暗面)' },
  { value: 'qwen3-coder', label: 'Qwen3 Coder (通义)' },
  { value: 'qwen3-max', label: 'Qwen3 Max (通义)' },
  { value: 'qwen-turbo', label: 'Qwen Turbo (通义)' },
  { value: 'qwen-plus', label: 'Qwen Plus (通义)' },
  { value: 'qwen-max', label: 'Qwen Max (通义)' },
  { value: 'qwen-long', label: 'Qwen Long (通义)' },
  { value: 'doubao-1-5-pro-32k', label: 'Doubao 1.5 Pro 32K (豆包)' },
  { value: 'doubao-1-5-pro-256k', label: 'Doubao 1.5 Pro 256K (豆包)' },
  { value: 'doubao-1-5-pro-32k-250115', label: 'Doubao 1.5 Pro 32K (最新)' },
  { value: 'doubao-1-5-lite-32k-250115', label: 'Doubao 1.5 Lite 32K (最新)' },
  { value: 'hunyuan-lite', label: 'Hunyuan Lite (腾讯)' },
  { value: 'hunyuan-standard', label: 'Hunyuan Standard (腾讯)' },
  { value: 'hunyuan-pro', label: 'Hunyuan Pro (腾讯)' },
  { value: 'hunyuan-turbo', label: 'Hunyuan Turbo (腾讯)' },
];

const imageModels = [
  { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image (Nano Banana)' },
  { value: 'gemini-3.0-pro-image-preview', label: 'Gemini 3.0 Pro Image Preview (🍌 Nano Banana Pro)' },
  { value: 'kling-v1', label: 'Kling V1' },
  { value: 'kling-v1-5', label: 'Kling V1.5' },
  { value: 'kling-v2', label: 'Kling V2' },
  { value: 'kling-v2-new', label: 'Kling V2 New' },
  { value: 'kling-v2-1', label: 'Kling V2.1' },
];

function App() {
  // 从 localStorage 读取配置
  const savedApiKey = localStorage.getItem('literature_apiKey');
  const savedBaseUrl = localStorage.getItem('literature_baseUrl');
  const savedImageApiKey = localStorage.getItem('image_apiKey');
  const savedImageModel = localStorage.getItem('image_model');
  
  const [literatureFile, setLiteratureFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('deepseek-v3.2');
  const [apiKey, setApiKey] = useState(savedApiKey || '');
  const [baseUrl, setBaseUrl] = useState(savedBaseUrl || 'https://apis.iflow.cn/v1');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [literatureDragOver, setLiteratureDragOver] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [methodPrompt, setMethodPrompt] = useState('');
  const [hasMethodPrompt, setHasMethodPrompt] = useState(false);
  const [selectedImageModel, setSelectedImageModel] = useState(savedImageModel || 'gemini-2.5-flash-image');
  const [imageApiKey, setImageApiKey] = useState(savedImageApiKey || '');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleLiteratureFile = (file) => {
    // 如果已经分析完成，提示用户点击再次上传按钮
    if (analysisComplete) {
      message.info({
        content: '当前分析已完成，请点击"再次上传"按钮开始新的分析',
        duration: 3,
      });
      return;
    }
    
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/') || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.txt'))) {
      setLiteratureFile(file);
      message.success('文献上传成功');
    } else {
      message.error('请上传 PDF 格式的文献文件');
    }
  };

  const handleImageFile = (file) => {
    // 如果已经分析完成，提示用户点击再次上传按钮
    if (analysisComplete) {
      message.info({
        content: '当前分析已完成，请点击"再次上传"按钮开始新的分析',
        duration: 3,
      });
      return;
    }
    
    if (file && (file.type.startsWith('image/') || file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.jpeg'))) {
      setImageFile(file);
      message.success('图片上传成功');
    } else {
      message.error('请上传图片或 PDF 文件');
    }
  };

  const handleLiteratureDrop = (e) => {
    e.preventDefault();
    setLiteratureDragOver(false);
    const file = e.dataTransfer.files[0];
    handleLiteratureFile(file);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setImageDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const handleSubmit = async () => {
    if (!literatureFile) {
      message.error('请上传文献文件');
      return;
    }

    if (!apiKey) {
      message.error('请先配置 API Key');
      setSettingsVisible(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('literature', literatureFile);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    formData.append('model', selectedModel);
    formData.append('apiKey', apiKey);
    formData.append('baseUrl', baseUrl);

    try {
      // 使用环境变量中的 API 地址，如果没有则使用本地地址
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${apiUrl}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // 后端返回的是 { report: string, methodPrompt: string, hasMethodPrompt: boolean }
      setResult(response.data.report);
      setAnalysisComplete(true);
      
      // 提取方法流程图提示词
      if (response.data.methodPrompt) {
        setMethodPrompt(response.data.methodPrompt);
        setHasMethodPrompt(response.data.hasMethodPrompt || false);
        
        if (response.data.hasMethodPrompt) {
          message.success('分析成功！已提取流程图提示词');
        } else {
          message.success('分析成功！已生成通用示意图提示词');
        }
      } else {
        message.success('分析成功');
      }
    } catch (err) {
      setError(err.response?.data?.error || '分析失败，请重试');
      message.error('分析失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLiteratureFile(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    setAnalysisComplete(false);
    setMethodPrompt('');
    setGeneratedImage(null);
    
    // 清空 input 的 value
    const literatureInput = document.getElementById('literature-upload');
    const imageInput = document.getElementById('image-upload');
    if (literatureInput) literatureInput.value = '';
    if (imageInput) imageInput.value = '';
    
    message.success('已重置，可以继续上传新文件');
  };

  const handleGenerateFlowchart = async () => {
    if (!methodPrompt) {
      message.error('请先分析方法以获取流程图提示词');
      return;
    }
    
    if (!imageApiKey) {
      message.error('请先配置七牛云 API Key');
      setSettingsVisible(true);
      return;
    }
    
    setGeneratingImage(true);
    setGeneratedImage(null);
    
    const formData = new FormData();
    formData.append('prompt', methodPrompt);
    formData.append('model', selectedImageModel);
    formData.append('apiKey', imageApiKey);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${apiUrl}/generate-flowchart`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        if (response.data.imageData) {
          setGeneratedImage(`data:image/png;base64,${response.data.imageData}`);
        } else if (response.data.imageUrl) {
          setGeneratedImage(response.data.imageUrl);
        }
        message.success('流程图生成成功！');
      } else {
        throw new Error('生成失败');
      }
    } catch (err) {
      message.error('生成失败：' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!methodPrompt) {
      message.error('没有可复制的提示词');
      return;
    }
    
    navigator.clipboard.writeText(methodPrompt).then(() => {
      message.success('提示词已复制到剪贴板！');
    }).catch((err) => {
      message.error('复制失败，请手动复制');
      console.error('复制失败:', err);
    });
  };

  const handlePreviewImage = () => {
    if (!generatedImage) {
      message.error('没有可预览的图片');
      return;
    }
    setPreviewVisible(true);
  };

  const handleDownload = () => {
    if (!result) return;
    
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `文献分析报告_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('报告下载成功');
  };

  const renderMarkdown = (markdown) => {
    if (!markdown) return null;
    
    const lines = markdown.split('\n');
    const renderedLines = lines.map((line, index) => {
      // 图片
      const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const alt = imgMatch[1];
        let imagePath = imgMatch[2];
        
        if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
          imagePath = imagePath.replace(/\\/g, '/');
          if (!imagePath.includes('/uploads/')) {
            imagePath = `/uploads/${imagePath}`;
          }
        }
        
        const fullImageUrl = imagePath.startsWith('http') 
          ? imagePath 
          : `http://localhost:3001${imagePath}`;
        
        return (
          <motion.img
            key={index}
            src={fullImageUrl} 
            alt={alt}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: '100%', height: 'auto', margin: '16px 0', borderRadius: '12px' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        );
      }
      
      // 标题
      if (line.startsWith('### ')) {
        return <h3 key={index}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index}>{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index}>{line.replace('# ', '')}</h1>;
      }
      
      // 列表
      if (line.startsWith('- ')) {
        return <li key={index}>{line.replace('- ', '')}</li>;
      }
      
      // 段落
      if (line.trim()) {
        return <p key={index}>{line}</p>;
      }
      
      return null;
    });
    
    return <div>{renderedLines}</div>;
  };

  return (
    <div className="app-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="app-title">
          让知识随心<span className="highlight">流动</span>
        </h1>
        <p className="app-subtitle">内容由 AI 生成</p>
      </motion.div>
      
      <motion.div
        className="search-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="search-box-title">
          像人类专家一样，自动完成研级报告
        </div>
        <p className="search-box-description">
          请在下方上传文献文件，系统将自动生成详细的分析报告
        </p>
        
        <div className="upload-section">
          <motion.div
            className={`upload-item ${literatureFile ? 'has-file' : ''} ${literatureDragOver ? 'drag-over' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => document.getElementById('literature-upload').click()}
            onDragOver={(e) => {
              e.preventDefault();
              setLiteratureDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setLiteratureDragOver(false);
            }}
            onDrop={handleLiteratureDrop}
            style={{ cursor: 'pointer' }}
          >
            <h3>
              <FileTextOutlined className="upload-icon" />
              1. 上传文献文件
            </h3>
            <div style={{ marginTop: 12 }}>
              <input
                id="literature-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleLiteratureFile(file);
                  }
                }}
              />
              <p style={{ fontSize: 13, color: literatureFile ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                {literatureFile ? `✓ ${literatureFile.name}` : '点击或拖拽文件到此处上传'}
              </p>
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-light)' }}>
                支持格式：PDF, DOCX, TXT
              </p>
            </div>
          </motion.div>
          
          <motion.div
            className={`upload-item ${imageFile ? 'has-file' : ''} ${imageDragOver ? 'drag-over' : ''}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => document.getElementById('image-upload').click()}
            onDragOver={(e) => {
              e.preventDefault();
              setImageDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setImageDragOver(false);
            }}
            onDrop={handleImageDrop}
            style={{ cursor: 'pointer' }}
          >
            <h3>
              <PictureOutlined className="upload-icon" />
              2. 上传方法流程图提示词图片（可选）
            </h3>
            <div style={{ marginTop: 12 }}>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleImageFile(file);
                  }
                }}
              />
              <p style={{ fontSize: 13, color: imageFile ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                {imageFile ? `✓ ${imageFile.name}` : '点击或拖拽图片到此处上传'}
              </p>
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-light)' }}>
                支持格式：JPG, PNG
              </p>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          className="model-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="model-label">
            <RobotOutlined className="model-icon" />
            选择 AI 模型：
          </div>
          <Select 
            value={selectedModel} 
            onChange={setSelectedModel} 
            className="model-select"
            disabled={loading}
          >
            {models.map(model => (
              <Option key={model.value} value={model.value}>
                {model.label}
              </Option>
            ))}
          </Select>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {analysisComplete ? (
            <Button 
              type="default" 
              className="submit-button"
              onClick={handleReset}
              icon={<FileTextOutlined />}
            >
              再次上传
            </Button>
          ) : (
            <Button 
              type="primary" 
              className="submit-button"
              onClick={handleSubmit}
              loading={loading}
              disabled={!literatureFile}
            >
              {loading ? '分析中...' : '开始分析'}
            </Button>
          )}
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="error-message-text">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Spin size="large" />
            <p className="loading-text">正在分析文献，请稍候...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {result && (
          <div className="results-container">
            <motion.div
              className="result-section"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.6 }}
            >
              <div className="result-card">
                <div className="result-header">
                  <h2 className="result-title">分析报告</h2>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    className="download-button-inline"
                  >
                    下载报告
                  </Button>
                </div>
                <motion.div
                  className="result-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {renderMarkdown(result)}
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              className="result-section"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="result-card">
                <div className="result-header">
                  <h2 className="result-title">
                    🎨 {hasMethodPrompt ? '方法流程图提示词' : '通用示意图提示词'}
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {!hasMethodPrompt && (
                      <Tooltip title="该文献没有具体实验方法，这是根据研究内容生成的通用示意图提示词">
                        <span style={{ fontSize: '12px', color: '#faad14', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⚠️ 通用提示词
                        </span>
                      </Tooltip>
                    )}
                    <Tooltip title="建议您将提示词复制到生图模型官网进行生图，效果会更好哦">
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LinkOutlined />
                        推荐：
                        <a href="https://www.doubao.com/chat/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                          豆包
                        </a>
                        <span style={{ margin: '0 4px' }}>、</span>
                        <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                          Gemini
                        </a>
                        <span style={{ margin: '0 4px' }}>等</span>
                      </span>
                    </Tooltip>
                  </div>
                </div>
                <div className="prompt-section">
                  <div className="prompt-controls">
                    <div className="model-selector">
                      <span className="model-label">选择图像模型：</span>
                      <Select 
                        value={selectedImageModel} 
                        onChange={setSelectedImageModel} 
                        className="image-model-select"
                        disabled={generatingImage}
                        style={{ width: '100%' }}
                      >
                        {imageModels.map(model => (
                          <Option key={model.value} value={model.value}>
                            {model.label}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="button-group">
                      <Button 
                        icon={<CopyOutlined />}
                        onClick={handleCopyPrompt}
                        className="copy-button"
                      >
                        复制提示词
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<PictureOutlined />}
                        onClick={handleGenerateFlowchart}
                        loading={generatingImage}
                        className="generate-button"
                      >
                        {generatingImage ? '生成中...' : '生成流程图'}
                      </Button>
                    </div>
                  </div>
                  <div className="prompt-content">
                    <pre>{methodPrompt}</pre>
                  </div>
                  {generatedImage && (
                    <motion.div
                      className="generated-image-container"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <div className="generated-image-header">
                        <h3 className="generated-image-title">🖼️ 生成的流程图</h3>
                        <Space>
                          <Button 
                            icon={<ZoomInOutlined />}
                            onClick={handlePreviewImage}
                            size="small"
                          >
                            放大查看
                          </Button>
                          <Button 
                            type="primary" 
                            icon={<DownloadOutlined />}
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = generatedImage;
                              link.download = `流程图_${Date.now()}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              message.success('图片下载成功');
                            }}
                            size="small"
                          >
                            下载图片
                          </Button>
                        </Space>
                      </div>
                      <motion.img
                        src={generatedImage}
                        alt="生成的流程图"
                        className="generated-image"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        onClick={handlePreviewImage}
                        style={{ cursor: 'pointer' }}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* 图片预览 Modal */}
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={900}
        centered
        closeIcon={null}
        styles={{
          body: { padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }
        }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <img
            src={generatedImage}
            alt="生成的流程图"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <Button
            type="text"
            size="large"
            onClick={() => setPreviewVisible(false)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}
          >
            ✕
          </Button>
        </div>
      </Modal>
      
      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>API 配置</span>
          </Space>
        }
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSettingsVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            if (!apiKey) {
              message.error('请输入 API Key');
              return;
            }
            if (!baseUrl) {
              message.error('请输入 Base URL');
              return;
            }
            // 保存到 localStorage
            localStorage.setItem('literature_apiKey', apiKey);
            localStorage.setItem('literature_baseUrl', baseUrl);
            localStorage.setItem('image_apiKey', imageApiKey);
            localStorage.setItem('image_model', selectedImageModel);
            message.success('配置已保存');
            setSettingsVisible(false);
          }}>
            保存
          </Button>,
        ]}
        width={700}
      >
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="分析 API 配置"
            description={
              <div>
                <p>1. 请访问 <a href="https://platform.iflow.cn" target="_blank" rel="noopener noreferrer">心流开放平台</a> 获取 API Key</p>
                <p>2. 默认 Base URL 为：https://apis.iflow.cn/v1</p>
                <p>3. API Key 会在本地使用，不会上传到服务器</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
              API Key *
            </label>
            <Password
              placeholder="请输入您的 API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
              Base URL *
            </label>
            <Input
              placeholder="https://apis.iflow.cn/v1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginTop: 30, marginBottom: 20, borderTop: '1px solid #e8e8e8', paddingTop: 20 }}>
            <Alert
              message="文生图 API 配置"
              description={
                <div>
                  <p>1. 请访问 <a href="https://portal.qiniu.com/ai/llm" target="_blank" rel="noopener noreferrer">七牛云 AI 大模型</a> 获取 API Key</p>
                  <p>2. 七牛云 API 支持多种图像生成模型，包括 Gemini 和 Kling 系列</p>
                  <p>3. 推荐使用 Gemini 2.5 Flash Image 或 Kling V2 模型</p>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 20 }}
            />
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                七牛云 API Key *
              </label>
              <Password
                placeholder="请输入七牛云 API Key"
                value={imageApiKey}
                onChange={(e) => setImageApiKey(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                默认图像模型
              </label>
              <Select 
                value={selectedImageModel} 
                onChange={setSelectedImageModel} 
                style={{ width: '100%' }}
              >
                {imageModels.map(model => (
                  <Option key={model.value} value={model.value}>
                    {model.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          
          <Alert
            message="支持的文本模型"
            description={
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                <p><strong>DeepSeek:</strong> deepseek-v3.2, deepseek-v3, deepseek-r1</p>
                <p><strong>智谱 GLM:</strong> glm-4-flash, glm-4-plus, glm-4-air, glm-4v-flash, glm-z1-flash</p>
                <p><strong>通义千问:</strong> qwen-turbo, qwen-plus, qwen-max, qwen-long</p>
                <p><strong>月之暗面:</strong> kimi-k2, kimi-k1-8k, kimi-latest</p>
                <p><strong>豆包:</strong> doubao-1-5-pro-32k, doubao-1-5-pro-256k</p>
                <p><strong>腾讯混元:</strong> hunyuan-lite, hunyuan-standard, hunyuan-pro, hunyuan-turbo</p>
              </div>
            }
            type="success"
            showIcon
          />
        </div>
      </Modal>
      
      <Button
        className="config-button"
        icon={<SettingOutlined />}
        onClick={() => setSettingsVisible(true)}
      >
        配置
      </Button>
    </div>
  );
}

export default App;
