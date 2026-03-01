const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const codeAnalyzer = require('./codeAnalyzer');

class LiteratureAnalyzer {
  // 分析文献
  async analyze(literaturePath, imagePath) {
    try {
      // 读取文献内容
      const content = await this.readFile(literaturePath);
      
      // 识别文献类型
      const literatureType = this.identifyLiteratureType(content);
      
      // 提取基础信息
      const basicInfo = this.extractBasicInfo(content);
      
      // 根据文献类型提取内容
      let contentAnalysis = {};
      if (literatureType === 'experimental') {
        contentAnalysis = this.extractExperimentalContent(content);
        // 生成方法流程图提示词
        contentAnalysis.methodPrompt = this.generateMethodPrompt(contentAnalysis.methods);
      } else if (literatureType === 'theoretical' || literatureType === 'review') {
        contentAnalysis = this.extractTheoreticalReviewContent(content, literatureType);
      }
      
      // 提取结论与局限
      const conclusionsLimitations = this.extractConclusionsLimitations(content);
      
      // 分析代码（如果有）
      const codeAnalysis = await codeAnalyzer.analyze(content, path.dirname(literaturePath));
      
      // 生成最终输出
      const result = this.generateOutput(basicInfo, contentAnalysis, conclusionsLimitations, literatureType, codeAnalysis);
      
      return result;
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
    } else if (extension === '.txt') {
      return fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error('不支持的文件格式');
    }
  }

  // 识别文献类型
  identifyLiteratureType(content) {
    const experimentalKeywords = ['experiment', 'experimental', 'method', 'methods', 'result', 'results', 'data', 'analysis', 'sample', 'samples', 'test', 'tests'];
    const reviewKeywords = ['review', 'survey', 'overview', 'summary', 'literature review'];
    const theoreticalKeywords = ['theory', 'theoretical', 'model', 'models', 'simulation', 'simulations', 'calculation', 'calculations'];

    let experimentalCount = 0;
    let reviewCount = 0;
    let theoreticalCount = 0;

    const lowerContent = content.toLowerCase();
    
    experimentalKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'g');
      const matches = lowerContent.match(regex);
      if (matches) experimentalCount += matches.length;
    });

    reviewKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'g');
      const matches = lowerContent.match(regex);
      if (matches) reviewCount += matches.length;
    });

    theoreticalKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'g');
      const matches = lowerContent.match(regex);
      if (matches) theoreticalCount += matches.length;
    });

    const maxCount = Math.max(experimentalCount, reviewCount, theoreticalCount);
    if (maxCount === experimentalCount) return 'experimental';
    if (maxCount === reviewCount) return 'review';
    if (maxCount === theoreticalCount) return 'theoretical';
    return 'experimental'; // 默认类型
  }

  // 提取基础信息
  extractBasicInfo(content) {
    // 提取标题
    const titleMatch = content.match(/^(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '原文未提供标题';
    
    // 提取关键词
    const keywordsMatch = content.match(/keywords?[:：]\s*([^\n]+)/i);
    let keywords = [];
    if (keywordsMatch) {
      keywords = keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k);
    } else {
      keywords = ['原文未标注关键词'];
    }
    
    // 提取来源信息
    const yearMatch = content.match(/(19|20)\d{2}/);
    const year = yearMatch ? yearMatch[0] : '原文未提供';
    
    const journalMatch = content.match(/journal[:：]\s*([^\n]+)/i) || 
                        content.match(/publication[:：]\s*([^\n]+)/i);
    const journal = journalMatch ? journalMatch[1].trim() : '原文未提供';
    
    const authorMatch = content.match(/author[:：]\s*([^\n]+)/i) || 
                       content.match(/authors[:：]\s*([^\n]+)/i);
    const authors = authorMatch ? authorMatch[1].trim() : '原文未提供';
    
    const affiliationMatch = content.match(/affiliation[:：]\s*([^\n]+)/i) || 
                           content.match(/institution[:：]\s*([^\n]+)/i);
    const affiliation = affiliationMatch ? affiliationMatch[1].trim() : '原文未提供单位信息';

    return {
      title,
      keywords,
      year,
      journal,
      authors,
      affiliation
    };
  }

  // 提取实验类文献内容
  extractExperimentalContent(content) {
    // 提取研究背景与问题
    const backgroundMatch = content.match(/background[:：]\s*([\s\S]+?)(methods?|materials?|result|results|conclusion|conclusions)/i);
    const background = backgroundMatch ? backgroundMatch[1].trim() : '原文未提供研究背景';
    
    // 提取方法与材料
    const methodsMatch = content.match(/methods?[:：]\s*([\s\S]+?)(materials?|result|results|conclusion|conclusions)/i);
    const materialsMatch = content.match(/materials?[:：]\s*([\s\S]+?)(methods?|result|results|conclusion|conclusions)/i);
    
    let methods = '原文未提供实验方法';
    let materials = '原文未提供材料信息';
    
    if (methodsMatch) methods = methodsMatch[1].trim();
    if (materialsMatch) materials = materialsMatch[1].trim();
    
    // 提取表征技术
    const characterizationMatch = content.match(/characterization[:：]\s*([\s\S]+?)(result|results|conclusion|conclusions)/i);
    const characterization = characterizationMatch ? characterizationMatch[1].trim() : '原文未提供表征技术';
    
    // 提取结果与发现
    const resultsMatch = content.match(/results?[:：]\s*([\s\S]+?)(discussion|conclusion|conclusions)/i);
    const results = resultsMatch ? resultsMatch[1].trim() : '原文未提供实验结果';

    return {
      background,
      methods,
      materials,
      characterization,
      results
    };
  }

  // 提取理论/综述类文献内容
  extractTheoreticalReviewContent(content, type) {
    // 提取理论框架/综述范围
    const frameworkMatch = content.match(/(framework|scope|overview)[:：]\s*([\s\S]+?)(main|key|argument|arguments|finding|findings|conclusion|conclusions)/i);
    const framework = frameworkMatch ? frameworkMatch[2].trim() : '原文未提供理论框架/综述范围';
    
    // 提取主要论点/发现
    const argumentsMatch = content.match(/(main|key)\s*(argument|arguments|finding|findings)[:：]\s*([\s\S]+?)(conclusion|conclusions)/i);
    const mainArguments = argumentsMatch ? argumentsMatch[3].trim() : '原文未提供主要论点/发现';

    return {
      framework,
      mainArguments
    };
  }

  // 提取结论与局限
  extractConclusionsLimitations(content) {
    // 提取结论
    const conclusionMatch = content.match(/conclusions?[:：]\s*([\s\S]+?)(limitation|limitations|reference|references)/i);
    const conclusion = conclusionMatch ? conclusionMatch[1].trim() : '原文未提供结论';
    
    // 提取局限
    const limitationMatch = content.match(/limitations?[:：]\s*([\s\S]+?)(reference|references)/i);
    const limitation = limitationMatch ? limitationMatch[1].trim() : '作者未明确讨论局限性';

    return {
      conclusion,
      limitation
    };
  }

  // 生成方法流程图提示词
  generateMethodPrompt(methods) {
    // 基于方法描述生成AI提示词
    return `Generate a detailed method flowchart based on the following experimental methods: ${methods}. Include key steps, parameters, and equipment used. Use a clear, professional scientific style with appropriate symbols and labels.`;
  }

  // 生成最终输出
  generateOutput(basicInfo, contentAnalysis, conclusionsLimitations, literatureType, codeAnalysis) {
    let output = `# 文献分析报告\n\n`;
    
    // 基础信息
    output += `## 基础信息\n\n`;
    output += `### 标题\n`;
    output += `- 原文标题：${basicInfo.title}\n`;
    output += `- 中文译名：译文由分析生成\n\n`;
    
    output += `### 关键词\n`;
    if (basicInfo.keywords[0] === '原文未标注关键词') {
      output += `- ${basicInfo.keywords[0]}\n\n`;
    } else {
      basicInfo.keywords.forEach(keyword => {
        output += `- ${keyword} (${keyword})\n`; // 简化处理，实际应进行翻译
      });
      output += `\n`;
    }
    
    output += `### 来源信息\n`;
    output += `- 发表年份：${basicInfo.year}\n`;
    output += `- 期刊/会议名称：${basicInfo.journal}\n`;
    output += `- 第一作者：${basicInfo.authors}\n`;
    output += `- 单位：${basicInfo.affiliation}\n\n`;
    
    // 内容分析
    output += `## 内容分析\n\n`;
    if (literatureType === 'experimental') {
      output += `### 研究背景与问题\n`;
      output += `- ${contentAnalysis.background}\n\n`;
      
      output += `### 方法与材料\n`;
      output += `- 原材料/数据集：${contentAnalysis.materials}\n`;
      output += `- 实验/模拟方法：${contentAnalysis.methods}\n`;
      output += `- 方法流程图提示词：${contentAnalysis.methodPrompt}\n`;
      output += `- 表征技术：${contentAnalysis.characterization}\n\n`;
      
      output += `### 结果与发现\n`;
      output += `- ${contentAnalysis.results}\n\n`;
    } else if (literatureType === 'theoretical' || literatureType === 'review') {
      output += `### 理论框架/综述范围\n`;
      output += `- ${contentAnalysis.framework}\n\n`;
      
      output += `### 主要论点/发现\n`;
      output += `- ${contentAnalysis.mainArguments}\n\n`;
    }
    
    // 代码分析
    output += `## 代码分析\n\n`;
    output += `- ${codeAnalysis}\n\n`;
    
    // 结论与局限
    output += `## 结论与局限\n\n`;
    output += `### 核心结论\n`;
    output += `- ${conclusionsLimitations.conclusion}\n\n`;
    
    output += `### 局限性\n`;
    output += `- ${conclusionsLimitations.limitation}\n\n`;
    
    return output;
  }
}

module.exports = new LiteratureAnalyzer();