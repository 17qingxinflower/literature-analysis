# 计划：使用 Spire.PDF 提取 PDF 图片

## 目标
取消 MinerU API 方案，改用 Python 的 Spire.PDF 库提取 PDF 中的图片。

## 问题分析
- MinerU API 需要公网 URL，无法上传本地 PDF 文件
- 需要使用本地 Python 库提取图片

## 解决方案
使用 Spire.PDF for Python 库提取 PDF 图片（根据 CSDN 博客文章）

## 执行步骤

### 1. 安装 Spire.PDF Python 库
```bash
pip install spire.pdf
```

### 2. 创建 Python 图片提取脚本
创建 `backend/scripts/extract_pdf_images.py`，使用 Spire.PDF 提取图片

### 3. 修改 pdfImageExtractor.js
- 添加调用 Python 脚本的方法
- 确保能正确获取提取的图片路径

### 4. 测试验证
- 运行后端服务
- 上传 PDF 测试图片提取功能

## 预期结果
PDF 中的图片能够被提取并在分析报告中显示
