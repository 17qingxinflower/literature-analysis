# 计划：PDF 转 Markdown 流程改造

## 目标
修改文献分析流程：先将用户上传的 PDF 文件转换为 Markdown 格式并保存，再从 Markdown 文件中提取图片和进行后续分析。

## 现有流程（需要改造）

```
用户上传 PDF → pdf-parse 提取文本 → pdfImageExtractor 提取图片 → LLM 分析
```

## 新流程（改造后）

```
用户上传 PDF → MinerU 转为 Markdown 并保存 → 从 Markdown 提取图片 → LLM 分析
```

## 改造内容

### 1. 修改 `backend/index.js`
- 添加保存 Markdown 文件的逻辑
- 在文件上传后先调用 MinerU 转换
- 将 Markdown 文件路径传递给后续分析

### 2. 修改 `backend/src/analyzers/llmAnalyzer.js`

#### 2.1 修改 `readFile` 方法
- 增加对 `.md` 文件的支持
- 读取本地保存的 Markdown 文件内容

#### 2.2 修改 `analyzeWithLLM` 方法
- 判断是否为 PDF 文件
  - 如果是 PDF：调用 MinerU 转换为 Markdown
  - 如果是 Markdown：直接使用
转换- 从结果中提取图片列表
- 后续图片分析基于提取的图片进行

### 3. 新增 Markdown 图片提取逻辑
- MinerU 已经会提取图片并返回
- 需要修改 `analyzeWithLLM` 使用 MinerU 返回的图片
- 而不是使用 `pdfImageExtractor` 重新提取

## 实现步骤

### 步骤 1：修改 `llmAnalyzer.js` 的 `readFile` 方法
- 添加对 `.md` 文件的读取支持

### 步骤 2：在 `llmAnalyzer.js` 中添加 PDF 转 Markdown 方法
- 调用 `mineruExtractor.extractFromPDF`
- 保存 Markdown 文件到本地

### 步骤 3：修改 `analyzeWithLLM` 方法
- 接收 Markdown 内容（而非原始 PDF 文本）
- 使用 MinerU 提取的图片进行后续分析
- 移除原有的 `pdfImageExtractor` 调用

### 步骤 4：测试验证
- 运行后端服务
- 上传 PDF 测试分析功能
- 确认 Markdown 文件正确保存
- 确认分析结果正确

## 预计改动文件

| 文件 | 改动内容 |
|------|----------|
| `backend/src/analyzers/llmAnalyzer.js` | 主要逻辑修改 |
| `backend/index.js` | 可能需要调整文件处理流程 |
