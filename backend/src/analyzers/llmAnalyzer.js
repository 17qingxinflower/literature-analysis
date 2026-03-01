const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const pdfImageExtractor = require('../utils/pdfImageExtractor');

class LLMAnalyzer {
  constructor() {
    this.currentApiKey = null;
    this.currentBaseUrl = null;
    this.currentModel = null;
  }

  setConfig(apiKey, baseUrl, model) {
    this.currentApiKey = apiKey;
    this.currentBaseUrl = baseUrl;
    this.currentModel = model;
  }

  getConfig() {
    return {
      apiKey: this.currentApiKey || process.env.IFLOW_API_KEY || '',
      baseUrl: this.currentBaseUrl || process.env.IFLOW_BASE_URL || 'https://apis.iflow.cn/v1',
      model: this.currentModel || process.env.IFLOW_MODEL || 'deepseek-v3.2'
    };
  }

  async callLLM(prompt, content, detectSourceCode = false) {
    const config = this.getConfig();
    console.log('API Key:', config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'empty');
    console.log('API Key length:', config.apiKey ? config.apiKey.length : 0);
    console.log('Model:', config.model);
    console.log('Base URL:', config.baseUrl);
    
    let fullPrompt = `${prompt}\n\n`;
    
    // 只在需要时添加源码检测任务
    if (detectSourceCode) {
      fullPrompt += `【重要任务】检测文献中是否提供了源码或源码地址（如GitHub链接、官方代码仓库、补充材料链接等）。

请在返回的JSON中添加一个"sourceCode"字段，格式如下：
"sourceCode": {
  "hasSourceCode": true/false,
  "sourceCodeUrls": ["https://github.com/xxx/xxx", "https://xxx.com/xxx"],
  "sourceCodeDescription": "源码描述（如：GitHub代码仓库、官方实现代码等）"
}

其中：
- hasSourceCode: 是否有源码（true/false）
- sourceCodeUrls: 源码URL列表（如果有多个，都列出来）
- sourceCodeDescription: 源码描述（简要说明源码的性质和位置）

`;
    }
    
    fullPrompt += `${content}`;

    try {
      const requestBody = {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的学术文献分析助手，擅长从学术论文中提取关键信息并生成结构化的分析报告。请严格按照用户要求提取信息，不要添加任何主观解释。务必提取原文中的所有信息，不要遗漏任何重要内容。'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      };
      
      console.log('Request body:', JSON.stringify(requestBody));
      console.log('Full URL:', `${config.baseUrl}/chat/completions`);
      
      const response = await axios.post(`${config.baseUrl}/chat/completions`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        timeout: 300000,
        retry: 5,
        retryDelay: 2000,
        maxRedirects: 5
      });

      const data = response.data;
      
      // 打印完整的响应数据用于调试
      console.log('API响应状态码:', response.status);
      console.log('API响应数据:', JSON.stringify(data).substring(0, 500));
      
      // 检查是否返回错误
      if (data.status && data.status !== '200' && data.status !== 200 && data.status !== 0) {
        throw new Error(`API错误: ${data.msg || data.message || data.status} - 请检查API Key和Base URL是否正确`);
      }
      
      // 处理不同的API响应格式
      if (data.choices && data.choices[0]) {
        return data.choices[0].message?.content || data.choices[0]?.content || '';
      } else if (data.content) {
        return data.content;
      } else if (data.text) {
        return data.text;
      } else if (data.result) {
        // 支持某些API返回result字段
        return data.result;
      } else if (data.output) {
        // 支持某些API返回output字段
        return data.output;
      } else if (data.response) {
        // 支持某些API返回response字段
        return data.response;
      } else if (typeof data === 'string') {
        // 支持某些API直接返回字符串
        return data;
      } else {
        console.log('完整的API响应:', JSON.stringify(data, null, 2));
        throw new Error(`API响应格式未知。响应状态码: ${response.status}。请检查API Key、Base URL和模型名称是否正确。响应数据: ${JSON.stringify(data).substring(0, 200)}`);
      }
    } catch (error) {
      console.error('LLM调用失败:', error);
      throw error;
    }
  }

  async analyze(literaturePath, imagePath) {
    console.log('################################################');
    console.log('### LLMAnalyze.analyze() 方法被调用 ###');
    console.log('################################################');
    console.log('literaturePath:', literaturePath);
    console.log('imagePath:', imagePath);
    
    // 检查配置是否已设置
    const config = this.getConfig();
    console.log('当前配置:');
    console.log('- API Key已设置:', config.apiKey ? '是' : '否');
    console.log('- Base URL:', config.baseUrl);
    console.log('- Model:', config.model);
    
    if (!config.apiKey) {
      throw new Error('API Key未设置，请先配置API Key');
    }
    
    try {
      // 读取文献内容
      console.log('开始读取文献内容...');
      const content = await this.readFile(literaturePath);
      console.log('文献内容读取完成，长度:', content.length);
      
      // 使用LLM进行综合分析（传入文献路径以提取PDF图片）
      const analysisResult = await this.analyzeWithLLM(content, imagePath, literaturePath);
      
      return analysisResult;
    } catch (error) {
      console.error('分析错误:', error);
      throw error;
    }
  }

  // 读取文件内容
  async readFile(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    
    if (extension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (extension === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (extension === '.txt' || extension === '.md') {
      return fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error('不支持的文件格式');
    }
  }

  // 将PDF转换为Markdown并保存
  async convertPDFToMarkdown(pdfPath) {
    console.log('################################################');
    console.log('### convertPDFToMarkdown() 被调用 ###');
    console.log('################################################');
    try {
      console.log('===== 开始将PDF转换为Markdown =====');
      const outputDir = path.join(path.dirname(pdfPath), 'markdown_output');
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const result = await pdfImageExtractor.extractWithMinerU(pdfPath, outputDir);
      
      if (result.markdown) {
        const mdFileName = path.basename(pdfPath, path.extname(pdfPath)) + '.md';
        const mdFilePath = path.join(outputDir, mdFileName);
        
        fs.writeFileSync(mdFilePath, result.markdown, 'utf8');
        console.log(`Markdown文件已保存: ${mdFilePath}`);
        
        return {
          markdown: result.markdown,
          markdownPath: mdFilePath,
          images: result.images
        };
      }
      
      return { markdown: '', markdownPath: '', images: [] };
    } catch (error) {
      console.error('PDF转Markdown失败:', error.message);
      return { markdown: '', markdownPath: '', images: [] };
    }
  }

  // 使用LLM进行文献分析
  async analyzeWithLLM(content, imagePath, literaturePath) {
    console.error('################################################');
    console.error('### analyzeWithLLM() 被调用 ###');
    console.error('################################################');
    console.error('===== 开始分析 =====');
    console.error('文献路径:', literaturePath);
    console.log('是否为PDF:', literaturePath ? literaturePath.toLowerCase().endsWith('.pdf') : false);
    
    let pdfImageAnalysis = '';
    let pdfImages = [];
    let actualContent = content;
    
    // 检查是否为PDF文件
    if (literaturePath && literaturePath.toLowerCase().endsWith('.pdf')) {
      console.error('===== 检测到PDF文件 =====');
      
      // 尝试使用原有方式提取图片
      console.error('===== 使用原有方式提取图片 =====');
      try {
        const imagesDir = path.join(path.dirname(literaturePath), 'pdf_images');
        
        pdfImages = await pdfImageExtractor.extractImagesFromPDF(literaturePath, imagesDir);
        console.error('提取到的图片数量:', pdfImages.length);
        
        if (pdfImages.length > 0) {
          console.error('===== 开始处理PDF图片 =====');
          
          // 同时包含 embedded 和 page_render 类型的图片
          // 优先选择 embedded 类型，但也保留重要的 page_render
          const embeddedImages = pdfImages.filter(img => img.type === 'embedded');
          const pageRenderImages = pdfImages.filter(img => img.type === 'page_render');
          
          // 过滤掉太小的图片（可能是装饰性图标）
          const filteredEmbedded = embeddedImages.filter(img => img.width > 200 && img.height > 200);
          const filteredPageRender = pageRenderImages.filter(img => img.width > 1000 && img.height > 1000);
          
          // 合并图片：优先使用embedded，如果没有足够的embedded，则添加page_render
          let imagesToProcess = [...filteredEmbedded];
          let selectedPageRenders = [];
          
          // 如果embedded图片少于5张，添加一些page_render图片
          if (filteredEmbedded.length < 5 && filteredPageRender.length > 0) {
            // 选择前3个page_render图片（通常是包含重要图表的页面）
            selectedPageRenders = filteredPageRender.slice(0, 3);
            imagesToProcess = [...imagesToProcess, ...selectedPageRenders];
          } else if (filteredPageRender.length > 0) {
            // 如果没有embedded图片但有page_render，选择前5个page_render
            selectedPageRenders = filteredPageRender.slice(0, 5);
            imagesToProcess = [...imagesToProcess, ...selectedPageRenders];
          }
          
          console.log(`选择处理的图片: ${imagesToProcess.map(img => img.name).join(', ')}`);
          console.log(`总图片数: ${imagesToProcess.length} (embedded: ${filteredEmbedded.length}, page_render: ${selectedPageRenders ? selectedPageRenders.length : 0})`);
          
          // 准备图片信息，让LLM来判断每张图片属于哪个部分
          const imageInfoList = imagesToProcess.map((img, idx) => ({
            id: idx + 1,
            page: img.page,
            path: img.path,
            name: img.name,
            width: img.width,
            height: img.height,
            type: img.type
          }));
          
          // 将图片信息转换为文本，传递给LLM
          const imageInfoText = imageInfoList.map(img => 
            `图片${img.id}（第${img.page}页，文件名：${img.name}，类型：${img.type === 'embedded' ? '嵌入图片' : '页面渲染'}）`
          ).join('\n');
          
          // 临时保存图片信息，供后续LLM分析使用
          this.currentImageInfo = imageInfoList;
        }
      } catch (error) {
        console.error('图片提取失败:', error.message);
      }
    } else {
      console.log('不是PDF文件，跳过图片提取');
    }
    
    // 如果有手动上传的图片（仅作为流程图风格参考）
    let styleReference = '';
    if (imagePath) {
      try {
        styleReference = '\n\n[风格参考：用户上传了参考图片，生成流程图时可参考此图片的风格和样式]';
      } catch (error) {
        console.error('处理参考图片失败:', error);
      }
    }
    
    // 第一步：提取基础信息
    const basicInfoPrompt = `你是一个专业的学术文献分析师。你的任务是从学术论文中详细提取信息。所有输出内容必须使用中文。

请从以下学术论文中提取所有基础信息，并以JSON格式返回：
- title: 论文完整标题（原文标题，保持原文语言）
- titleZh: 中文翻译标题
- keywords: 所有关键词（从原文关键词部分提取所有关键词，用逗号分隔）
- year: 4位数年份
- journal: 期刊/会议完整名称（包括卷号、期号、页码）
- authors: 所有作者姓名（按原文顺序）
- affiliation: 所有作者单位
- doi: DOI号（如果有）

请务必提取原文中的所有信息，不要遗漏任何内容。只返回JSON，不要添加任何解释。`;

    const basicInfoStr = await this.callLLM(basicInfoPrompt, actualContent, true);  // 只在第一次调用时检测源码
    let basicInfo = this.parseJSON(basicInfoStr);

    // 第二步：详细提取内容分析（结合PDF图片分析结果）
    let contentWithImage = actualContent;
    
    // 如果有图片信息，添加到内容中让LLM分析
    if (this.currentImageInfo && this.currentImageInfo.length > 0) {
      const imageInfoText = this.currentImageInfo.map(img => 
        `图片${img.id}（第${img.page}页，文件名：${img.name}）`
      ).join('\n');
      
      contentWithImage = `${actualContent}\n\n【PDF中的图片信息】\n${imageInfoText}`;
    }
    
    const typePrompt = `你是一个专业的学术文献分析师。你的任务是从学术论文中详细提取信息。所有输出内容必须使用中文。

请仔细阅读以下论文内容，进行全面分析：

${this.currentImageInfo && this.currentImageInfo.length > 0 ? `【重要任务】根据论文内容，判断以下每张图片属于论文的哪个部分（方法部分或结果部分），并评估其重要性：
- 方法部分：包括实验方法、实验设计、流程图、网络架构图、模型结构、实验装置图等
- 结果部分：包括实验结果数据图表、对比图、统计图、性能曲线、实验数据表格等

【PDF中的图片信息】
${this.currentImageInfo.map(img => `图片${img.id}（第${img.page}页，文件名：${img.name}）`).join('\n')}

请在返回的JSON中添加一个"imageClassification"字段，格式如下：
"imageClassification": [
  {"id": 1, "section": "methods/results", "reason": "判断理由", "importance": "high/medium/low", "importanceReason": "重要性判断理由"},
  {"id": 2, "section": "methods/results", "reason": "判断理由", "importance": "high/medium/low", "importanceReason": "重要性判断理由"}
]

其中：
- id: 图片编号（对应上面的图片1、图片2等）
- section: "methods"（方法部分）或 "results"（结果部分）
- reason: 判断理由（简短说明为什么认为这张图片属于该部分）
- importance: "high"（非常重要，如核心方法流程图、主要实验结果）、"medium"（中等重要，如辅助方法图、次要实验结果）、"low"（不重要，如装饰性图片、重复图表）
- importanceReason: 重要性判断理由（说明为什么这张图片重要或不重要）

` : ''}

1. 首先判断文献类型：
   - 实验研究论文（有实验方法、结果数据）
   - 理论推导论文（有数学公式、理论证明）
   - 综述论文（总结多个研究成果）

2. 如果是实验研究论文，请详细提取：
   - background: 完整的研究背景（领域现状、前人研究、存在的研究缺口），用中文描述
   - problem: 本文明确提出的研究问题和目标，用中文描述
   - materials: 所有原材料、样本、数据集的详细信息，用中文描述
   - methods: 完整的实验方法（包括具体步骤、参数设置、算法细节、设备型号），用中文描述
   - characterization: 所有表征技术和测试方法，用中文描述
   - results: 详细的实验结果（包括所有数据、图表描述、统计结果），用中文描述
   - discussion: 讨论部分的主要发现和解释，用中文描述

3. 如果是理论/综述论文，请提取：
   - framework: 完整的理论框架或综述范围，用中文描述
   - methodology: 研究方法或综述方法，用中文描述
   - arguments: 所有主要论点（按原文顺序列出），用中文描述
   - findings: 主要发现和结论，用中文描述

请尽可能详细地提取原文中的所有信息，不要遗漏任何重要内容。所有内容必须用中文输出。以JSON格式返回：
{
  "type": "experimental/theoretical/review",
  "content": {
    // 根据类型包含上述相应字段
  }${this.currentImageInfo && this.currentImageInfo.length > 0 ? `,
  "imageClassification": [
    {"id": 1, "section": "methods/results", "reason": "判断理由", "importance": "high/medium/low", "importanceReason": "重要性判断理由"}
  ]` : ''}
}

只返回JSON，不要添加任何解释。`;

    const contentStr = await this.callLLM(typePrompt, contentWithImage);
    const contentAnalysis = this.parseJSON(contentStr);
    
    // 处理源码信息
    let sourceCodeInfo = null;
    if (contentAnalysis.sourceCode) {
      console.log('收到LLM的源码信息:', JSON.stringify(contentAnalysis.sourceCode));
      sourceCodeInfo = contentAnalysis.sourceCode;
      
      // 如果有源码URL，下载源码
      if (sourceCodeInfo.hasSourceCode && sourceCodeInfo.sourceCodeUrls && sourceCodeInfo.sourceCodeUrls.length > 0) {
        await this.downloadSourceCode(sourceCodeInfo.sourceCodeUrls);
      }
    }
    
    // 处理图片分类结果
    if (this.currentImageInfo && this.currentImageInfo.length > 0) {
      console.log('开始处理图片，总数量:', this.currentImageInfo.length);
      
      let imageAnalysisResults = [];
      
      // 如果LLM返回了分类结果，使用分类结果
      if (contentAnalysis.imageClassification && Array.isArray(contentAnalysis.imageClassification)) {
        console.log('收到LLM的图片分类结果:', JSON.stringify(contentAnalysis.imageClassification));
        
        // 将图片信息与分类结果合并
        imageAnalysisResults = this.currentImageInfo.map(img => {
          const classification = contentAnalysis.imageClassification.find(c => c.id === img.id);
          return {
            id: img.id,
            page: img.page,
            path: img.path,
            name: img.name,
            width: img.width,
            height: img.height,
            section: classification ? classification.section : 'unknown',
            reason: classification ? classification.reason : '',
            importance: classification ? classification.importance : 'medium',
            importanceReason: classification ? classification.importanceReason : ''
          };
        });
        
        // 根据重要性过滤图片，只保留高重要性和中等重要性的图片
        const importantImages = imageAnalysisResults.filter(img => 
          img.importance === 'high' || img.importance === 'medium'
        );
        
        console.log(`原始图片数量: ${imageAnalysisResults.length}, 过滤后重要图片数量: ${importantImages.length}`);
        
        // 生成图片分析报告
        if (importantImages.length > 0) {
          pdfImageAnalysis = this.formatPDFImageAnalysisBySection(importantImages);
        } else {
          // 如果过滤后没有图片，使用所有图片
          console.log('过滤后没有图片，使用所有图片');
          pdfImageAnalysis = this.formatPDFImageAnalysisBySection(imageAnalysisResults);
        }
      } else {
        // 如果LLM没有返回分类结果，使用所有图片
        console.log('LLM没有返回分类结果，使用所有图片');
        
        imageAnalysisResults = this.currentImageInfo.map(img => ({
          id: img.id,
          page: img.page,
          path: img.path,
          name: img.name,
          width: img.width,
          height: img.height,
          section: 'unknown',
          reason: '',
          importance: 'medium',
          importanceReason: ''
        }));
        
        pdfImageAnalysis = this.formatPDFImageAnalysisBySection(imageAnalysisResults);
      }
      
      console.log('PDF图片分类完成，结果长度:', pdfImageAnalysis.length);
    }

    // 第三步：提取结论与局限
    const conclusionPrompt = `你是一个专业的学术文献分析师。你的任务是从学术论文中详细提取信息。所有输出内容必须使用中文。

请从以下学术论文中详细提取结论与局限信息：

1. 结论部分：
   - conclusion: 提取原文结论部分的完整内容，用中文描述核心结论
   - conclusionZh: 完整的中文翻译
    
2. 局限性部分：
   - limitations: 作者明确讨论的所有局限性，用中文描述
   - future_work: 作者提出的未来研究方向，用中文描述
 
3. 如果论文有摘要，也请提取：
   - abstract: 完整的原文摘要
   - abstractZh: 完整的中文摘要

请尽可能详细地提取原文中的所有信息。所有内容必须用中文输出。以JSON格式返回：
{
  "conclusion": "...",
  "conclusionZh": "...",
  "limitations": "...",
  "future_work": "...",
  "abstract": "...",
  "abstractZh": "..."
}

只返回JSON，不要添加任何解释。`;

    const conclusionStr = await this.callLLM(conclusionPrompt, actualContent);
    const conclusions = this.parseJSON(conclusionStr);

    // 第四步：生成方法流程图提示词
    let methodPrompt = '';
    if (contentAnalysis.type === 'experimental' && contentAnalysis.content && contentAnalysis.content.methods) {
      const methodsToUse = pdfImageAnalysis ? 
        `【实验方法描述】\n${contentAnalysis.content.methods}\n\n【PDF图片参考】\n${pdfImageAnalysis}` : 
        contentAnalysis.content.methods;
        
      const promptGenPrompt = `你是一个专业的科研图表设计师，擅长为顶级学术期刊（如IEEE、Nature、Science）设计方法流程图。

请根据以下实验方法，生成一段**极其详细、专业、可直接用于AI图像生成**的提示词（Prompt）。

## 提示词生成要求：

### 1. 整体风格要求（参考顶级期刊标准）
- **高分辨率**：适合学术出版的高质量图像（300 DPI以上）
- **专业学术风格**：严格遵循IEEE/ACM/Nature/Science等顶级期刊的图表美学标准
- **圆角矩形设计**：使用圆角矩形框表示各个阶段，具有现代感和专业感
- **柔和粉彩色系**：
  - 第一阶段：柔和蓝色（Soft Pastel Blue）
  - 第二阶段：柔和橙色/黄色（Soft Pastel Orange/Yellow）
  - 第三阶段：柔和绿色（Soft Pastel Green）
  - 其他阶段：使用协调的粉彩色系
- **宽高比适中**：16:9横向布局，不过于宽或过于窄，确保内容清晰可读
- **渐变效果**：在色块内使用柔和的渐变效果，增加层次感

### 2. 结构要求（多层次详细描述）
- **水平三阶段布局**：从左到右分为三个主要阶段（输入→处理→输出）
- **粗壮数据流箭头**：使用粗壮的箭头连接各阶段，箭头方向清晰
- **子模块细分**：每个主要阶段内包含多个子模块，用虚线框或浅色背景区分
- **输入/输出标注**：明确标注数据输入和结果输出
- **反馈回路**：如有迭代或反馈机制，用虚线箭头表示

### 3. 内容要求（极度详细）
- **所有文字标注必须使用简体中文**
- **技术细节完整**：
  - 具体的算法名称（如：ResNet-50、Transformer、YOLOv8等）
  - 网络架构细节（如：卷积层、池化层、全连接层的配置）
  - 参数设置（如：学习率0.001、批量大小32、迭代次数100等）
  - 设备型号和规格（如：NVIDIA RTX 4090、Intel i9-13900K等）
- **变量和符号标注**：
  - 数学符号使用LaTeX风格（如：$\\mathbf{x}$、$\\mathcal{L}$、$\\nabla$）
  - 向量/矩阵用粗体表示
  - 损失函数、优化器明确标注
- **关键技术创新点**：用星标或特殊图标标注创新点
- **数据维度标注**：标注张量形状（如：[B, C, H, W]）

### 4. 视觉元素（丰富多样）
- **模型架构图**：
  - 卷积块：用堆叠的矩形表示，标注卷积核大小（如：3×3 Conv）
  - 特征提取器：用梯形或特殊形状表示
  - 注意力机制：用放大镜图标或特殊符号表示
  - 残差连接：用跳跃箭头表示
- **数据流可视化**：
  - 输入数据：用图像图标表示（如：相机图标表示图像输入）
  - 特征图：用热力图样式的小图表示
  - 输出结果：用图表或检测框表示
- **图标系统**：
  - 传感器：使用传感器图标
  - 数据库：使用圆柱形数据库图标
  - 算法模块：使用齿轮或大脑图标
  - 计算单元：使用CPU/GPU图标
- **注释框**：用虚线框标注关键技术细节

### 5. 配色方案（专业协调）
- **背景色**：浅灰色或白色背景
- **阶段区分色**：
  - 数据预处理：淡蓝色 (#E3F2FD)
  - 特征提取：淡黄色 (#FFF9C4)
  - 模型训练：淡绿色 (#E8F5E9)
  - 推理/输出：淡紫色 (#F3E5F5)
- **文字颜色**：深灰色或黑色，确保可读性
- **强调色**：使用醒目的颜色标注关键信息（如：红色表示重要参数）

### 6. 输出格式（严格遵循）
请直接输出一段完整的英文Prompt（因为大多数AI图像生成工具对英文支持更好），格式如下：

\`\`\`
Prompt for Professional Scientific Illustration AI:

Create a high-resolution, professional academic methodological flowchart diagram, strictly following the aesthetic style of a top-tier IEEE journal paper (similar to the reference image style with rounded rectangular stages and pastel background colors). The overall aspect ratio should be moderate (e.g., 16:9 landscape), not overly wide. The color palette must be aesthetically pleasing, using soft pastels (blues, oranges/yellows, greens) to differentiate stages. Crucially, all text annotations within the diagram must be in Simplified Chinese characters, accurately reflecting the technical details provided below. Pay close attention to every technical detail mentioned.

[根据实验方法的具体内容，详细描述：
- 整体布局和风格
- 每个阶段的具体内容（包括所有技术细节、参数、变量）
- 模型架构的可视化表示（卷积块、特征提取器等）
- 箭头和数据流向
- 颜色方案
- 文字标注（中文）
- 技术细节和数学符号]

Style Notes: Ensure clean lines, professional soft gradients within the icons and boxes, and clear, legible Chinese text suitable for academic publication. The overall feel should be advanced technology integrated with complex system engineering.
\`\`\`

## 实验方法：
${methodsToUse}

请生成极其详细、专业的流程图提示词，确保包含所有技术细节、模型架构、变量符号和可视化元素：`;

      methodPrompt = await this.callLLM(promptGenPrompt, '');
    }

    // 生成最终报告
    const report = this.generateReport(basicInfo, contentAnalysis, conclusions, methodPrompt, pdfImageAnalysis, sourceCodeInfo);
    
    // 清理临时数据
    this.currentImageInfo = null;
    
    return report;
  }
  
  // 调用视觉模型分析图片
  async callVisionLLM(prompt, imagePath) {
    const config = this.getConfig();
    const visionModel = config.visionModel || 'glm-4v-flash';
    
    // 读取图片并转换为base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const imageType = path.extname(imagePath).toLowerCase().slice(1);
    const mimeType = imageType === 'jpg' ? 'jpeg' : imageType;
    
    console.log('开始分析图片，模型:', visionModel);
    
    try {
      const response = await axios.post(`${config.baseUrl}/chat/completions`, {
        model: visionModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        timeout: 120000
      });

      const data = response.data;
      
      console.log('Vision API 响应:', JSON.stringify(data).substring(0, 500));
      
      if (data.choices && data.choices[0]) {
        return data.choices[0].message?.content || '';
      } else if (data.content) {
        return data.content;
      }
      return '';
    } catch (error) {
      console.error('视觉模型调用失败:', error.message);
      throw error;
    }
  }
  
  // 分析图表图片并判断属于哪个部分
  async analyzeImageSection(imagePath, pageNum) {
    const prompt = `你是一个专业的学术文献图表分析师。请分析以下图片并回答两个问题：

1. 这张图片属于论文的哪个部分？
   - 如果是方法/方法论/实验设计/流程图/网络架构图/模型结构等，回答 "methods"
   - 如果是实验结果/数据图表/对比图/统计图/表格等，回答 "results"
   - 如果不确定，回答 "unknown"

2. 请详细描述图片内容：
   - 如果是流程图/架构图：请描述每个模块/步骤的功能和连接关系
   - 如果是实验结果图表：请描述坐标轴含义、数据趋势、主要发现
   - 如果是表格：请提取所有数据

请用以下JSON格式返回：
{"section": "methods/results/unknown", "analysis": "详细描述"}`;
    
    const result = await this.callVisionLLM(prompt, imagePath);
    
    // 尝试解析JSON
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          section: parsed.section || 'unknown',
          analysis: parsed.analysis || result
        };
      }
    } catch (e) {
      console.log('JSON解析失败，使用原始结果');
    }
    
    return {
      section: 'unknown',
      analysis: result
    };
  }
  
  // 分析图表图片
  async analyzeChartImage(imagePath, pageNum) {
    const prompt = `你是一个专业的学术文献图表分析师。请详细分析以下图片内容：

1. 如果是流程图/架构图：请描述每个模块/步骤的功能和连接关系
2. 如果是实验结果图表：请描述坐标轴含义、数据趋势、主要发现
3. 如果是表格：请提取所有数据
4. 如果是方法示意图：请描述技术细节

请提供详细的专业描述。`;
    
    return await this.callVisionLLM(prompt, imagePath);
  }
  
  // 格式化PDF图片分析结果（按部分分类）
  // 注意：不嵌入 base64，只提供路径，由前端渲染
  formatPDFImageAnalysisBySection(results) {
    let output = '';
    
    // 按部分分组
    const methodsImages = results.filter(r => r.section === 'methods');
    const resultsImages = results.filter(r => r.section === 'results');
    const unknownImages = results.filter(r => r.section === 'unknown');
    
    // 方法部分：只显示最重要的2张图表
    if (methodsImages.length > 0) {
      // 按重要性排序：high > medium > low
      const sortedMethods = methodsImages.sort((a, b) => {
        const importanceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      });
      
      // 只取前2张最重要的图表
      const topMethods = sortedMethods.slice(0, 2);
      
      output += `## 📌 方法部分图片（最重要的2张图表）\n\n`;
      for (const item of topMethods) {
        const relativePath = path.relative(path.join(__dirname, '..', '..'), item.path).replace(/\\/g, '/');
        const importanceBadge = item.importance === 'high' ? '⭐⭐⭐' : (item.importance === 'medium' ? '⭐⭐' : '⭐');
        output += `### 📊 图片${item.id} - 第${item.page}页 ${importanceBadge}\n\n`;
        output += `![图片${item.id}](/${relativePath})\n\n`;
        output += `**文件名**: ${item.name}\n\n`;
        output += `**判断理由**: ${item.reason || '无'}\n\n`;
        if (item.importanceReason) {
          output += `**重要性说明**: ${item.importanceReason}\n\n`;
        }
        output += `---\n\n`;
      }
    }
    
    // 结果部分：只显示最重要的1张图表
    if (resultsImages.length > 0) {
      // 按重要性排序：high > medium > low
      const sortedResults = resultsImages.sort((a, b) => {
        const importanceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      });
      
      // 只取前1张最重要的图表
      const topResult = sortedResults.slice(0, 1);
      
      output += `## 📌 实验结果部分图片（最重要的1张图表）\n\n`;
      for (const item of topResult) {
        const relativePath = path.relative(path.join(__dirname, '..', '..'), item.path).replace(/\\/g, '/');
        const importanceBadge = item.importance === 'high' ? '⭐⭐⭐' : (item.importance === 'medium' ? '⭐⭐' : '⭐');
        output += `### 📊 图片${item.id} - 第${item.page}页 ${importanceBadge}\n\n`;
        output += `![图片${item.id}](/${relativePath})\n\n`;
        output += `**文件名**: ${item.name}\n\n`;
        output += `**判断理由**: ${item.reason || '无'}\n\n`;
        if (item.importanceReason) {
          output += `**重要性说明**: ${item.importanceReason}\n\n`;
        }
        output += `---\n\n`;
      }
    }
    
    // 不显示未分类图片
    
    return output;
  }
  
  // 格式化PDF图片分析结果
  formatPDFImageAnalysis(results) {
    let output = '';
    
    for (const item of results) {
      output += `### 📊 第${item.page}页图片分析\n\n`;
      
      // 不嵌入 base64 图片（太大会导致 API 请求失败）
      // 只提供文字描述
      output += `**图片尺寸**: ${item.width} × ${item.height} 像素\n\n`;
      
      output += `**分析结果**:\n\n${item.analysis}\n\n`;
      output += `---\n\n`;
    }
    
    return output;
  }

  // 解析JSON，处理可能的格式问题
  parseJSON(str) {
    try {
      // 打印原始字符串用于调试
      console.log('尝试解析JSON，字符串长度:', str ? str.length : 0);
      console.log('原始字符串前200字符:', str ? str.substring(0, 200) : 'null');
      
      if (!str || typeof str !== 'string') {
        console.error('无效的输入字符串');
        return {};
      }
      
      // 尝试提取JSON部分
      const jsonMatch = str.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('JSON解析成功， keys:', Object.keys(parsed));
        return parsed;
      }
      
      // 如果没有匹配到JSON格式，尝试直接解析
      const parsed = JSON.parse(str);
      console.log('JSON直接解析成功， keys:', Object.keys(parsed));
      return parsed;
    } catch (error) {
      console.error('JSON解析失败:', error.message);
      console.error('原始字符串:', str ? str.substring(0, 500) : 'null');
      return {};
    }
  }

  // 下载源码
  async downloadSourceCode(urls) {
    const fs = require('fs');
    const path = require('path');
    const axios = require('axios');
    const AdmZip = require('adm-zip');

    // 创建下载目录
    const downloadDir = path.join(__dirname, '..', '..', 'downloads', 'source_code');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    console.log('开始下载源码...');
    console.log('源码URLs:', urls);

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        console.log(`正在下载源码 (${i + 1}/${urls.length}): ${url}`);

        // 下载文件
        const response = await axios({
          method: 'get',
          url: url,
          responseType: 'arraybuffer',
          timeout: 60000
        });

        // 从URL中提取文件名
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1] || `source_code_${i + 1}`;
        const filePath = path.join(downloadDir, fileName);

        // 保存文件
        fs.writeFileSync(filePath, response.data);
        console.log(`源码下载成功: ${filePath}`);

        // 如果是zip文件，自动解压
        if (fileName.endsWith('.zip')) {
          try {
            const zip = new AdmZip(filePath);
            const extractDir = path.join(downloadDir, fileName.replace('.zip', ''));
            zip.extractAllTo(extractDir, true);
            console.log(`源码解压成功: ${extractDir}`);
          } catch (error) {
            console.error(`解压失败: ${error.message}`);
          }
        }
      } catch (error) {
        console.error(`下载源码失败 (${url}): ${error.message}`);
      }
    }

    console.log('源码下载完成');
  }

  // 生成最终报告
  generateReport(basicInfo, contentAnalysis, conclusions, methodPrompt, pdfImageAnalysis, sourceCodeInfo) {
    let output = `# 文献分析报告\n\n`;

    // 基础信息
    output += `## 基础信息\n\n`;
    output += `### 标题\n`;
    output += `- 原文标题：${basicInfo.title || '原文未提供标题'}\n`;
    output += `- 中文译名：${basicInfo.titleZh || '译文由分析生成'}\n\n`;
    
    output += `### 关键词\n`;
    if (basicInfo.keywords === '原文未标注关键词' || !basicInfo.keywords) {
      output += `- 原文未标注关键词\n\n`;
    } else if (Array.isArray(basicInfo.keywords)) {
      basicInfo.keywords.forEach(keyword => {
        output += `- ${keyword}\n`;
      });
      output += `\n`;
    } else {
      output += `- ${basicInfo.keywords}\n\n`;
    }
    
    output += `### 来源信息\n`;
    output += `- 发表年份：${basicInfo.year || '原文未提供'}\n`;
    output += `- 期刊/会议名称：${basicInfo.journal || '原文未提供'}\n`;
    output += `- 所有作者：${basicInfo.authors || '原文未提供'}\n`;
    output += `- 作者单位：${basicInfo.affiliation || '原文未提供单位信息'}\n`;
    output += `- DOI：${basicInfo.doi || '原文未提供'}\n\n`;
    
    // 源码信息
    if (sourceCodeInfo && sourceCodeInfo.hasSourceCode) {
      output += `### 💻 源码信息\n`;
      output += `- 源码状态：已提供源码\n`;
      if (sourceCodeInfo.sourceCodeDescription) {
        output += `- 源码描述：${sourceCodeInfo.sourceCodeDescription}\n`;
      }
      if (sourceCodeInfo.sourceCodeUrls && sourceCodeInfo.sourceCodeUrls.length > 0) {
        output += `- 源码地址：\n`;
        sourceCodeInfo.sourceCodeUrls.forEach(url => {
          output += `  - ${url}\n`;
        });
      }
      output += `- 下载位置：D:\\LZJ\\论文阅读\\小工具\\backend\\downloads\\source_code\n\n`;
    } else {
      output += `### 💻 源码信息\n`;
      output += `- 源码状态：未提供源码\n\n`;
    }
    
    // 摘要
    if (conclusions.abstract) {
      output += `### 摘要\n`;
      output += `- 原文摘要：${conclusions.abstract}\n`;
      output += `- 中文摘要：${conclusions.abstractZh || '译文由分析生成'}\n\n`;
    }
    
    // PDF 图片分析结果 - 已取消
    // if (pdfImageAnalysis) {
    //   output += `## 📊 PDF 图片分析\n\n`;
    //   output += `${pdfImageAnalysis}\n\n`;
    // }
    
    // 内容分析
    output += `## 内容分析\n\n`;
    
    const content = contentAnalysis.content || {};
    
    if (contentAnalysis.type === 'experimental') {
      output += `### 研究背景与问题\n`;
      output += `#### 领域现状及前人研究缺口\n${content.background || '原文未提供研究背景'}\n\n`;
      output += `#### 本文拟解决的具体问题\n${content.problem || '原文未提供'}\n\n`;
      
      output += `### 方法与材料\n`;
      output += `#### 原材料/数据集\n${content.materials || '原文未提供材料信息'}\n\n`;
      output += `#### 实验/模拟方法\n${content.methods || '原文未提供实验方法'}\n\n`;
      
      if (methodPrompt) {
        output += `### 🔥 方法流程图提示词\n`;
        output += `\`\`\`\n${methodPrompt}\n\`\`\`\n\n`;
      }
      
      output += `#### 表征技术\n${content.characterization || '原文未提供表征技术'}\n\n`;
      
      output += `### 结果与发现\n`;
      output += `#### 实验结果\n${content.results || '原文未提供实验结果'}\n\n`;
      
      if (content.discussion) {
        output += `#### 讨论\n${content.discussion}\n\n`;
      }
    } else if (contentAnalysis.type === 'theoretical' || contentAnalysis.type === 'review') {
      output += `### 理论框架/综述范围\n`;
      output += `${content.framework || '原文未提供理论框架/综述范围'}\n\n`;
      
      if (content.methodology) {
        output += `### 研究方法\n${content.methodology}\n\n`;
      }
      
      output += `### 主要论点/发现\n`;
      output += `${content.arguments || '原文未提供主要论点/发现'}\n\n`;
      
      if (content.findings) {
        output += `### 主要发现\n${content.findings}\n\n`;
      }
    }
    
    // 结论与局限
    output += `## 结论与局限\n\n`;
    output += `### 核心结论\n`;
    output += `${conclusions.conclusion || '原文未提供结论'}\n\n`;
    output += `### 中文翻译\n${conclusions.conclusionZh || '译文由分析生成'}\n\n`;
    
    output += `### 局限性\n`;
    output += `${conclusions.limitations || '作者未明确讨论局限性'}\n\n`;
    
    if (conclusions.future_work) {
      output += `### 未来研究方向\n`;
      output += `${conclusions.future_work}\n\n`;
    }
    
    return output;
  }
}

module.exports = new LLMAnalyzer();
