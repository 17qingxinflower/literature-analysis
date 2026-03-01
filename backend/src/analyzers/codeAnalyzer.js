const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeAnalyzer {
  // 从文献中提取源代码仓库信息
  extractCodeRepository(literatureContent) {
    // 查找GitHub仓库URL
    const githubMatch = literatureContent.match(/https:\/\/github\.com\/[^\s]+/g);
    // 查找GitLab仓库URL
    const gitlabMatch = literatureContent.match(/https:\/\/gitlab\.com\/[^\s]+/g);
    // 查找其他代码仓库URL
    const repoMatch = literatureContent.match(/https:\/\/[^\s]+\.(git|github|gitlab|bitbucket)[^\s]+/g);

    return {
      github: githubMatch ? githubMatch[0] : null,
      gitlab: gitlabMatch ? gitlabMatch[0] : null,
      other: repoMatch ? repoMatch[0] : null
    };
  }

  // 克隆代码仓库
  cloneRepository(repoUrl, targetDir) {
    try {
      // 确保目标目录存在
      fs.ensureDirSync(targetDir);
      
      // 执行git clone命令
      execSync(`git clone ${repoUrl} ${targetDir}`, { stdio: 'inherit' });
      console.log(`成功克隆仓库: ${repoUrl}`);
      return true;
    } catch (error) {
      console.error('克隆仓库失败:', error.message);
      return false;
    }
  }

  // 分析代码结构
  analyzeCodeStructure(codeDir) {
    const structure = {
      files: [],
      directories: [],
      languages: {},
      totalFiles: 0
    };

    // 遍历代码目录
    function traverse(dir, relativePath = '') {
      const entries = fs.readdirSync(dir);
      
      entries.forEach(entry => {
        const entryPath = path.join(dir, entry);
        const stats = fs.statSync(entryPath);
        const entryRelativePath = path.join(relativePath, entry);
        
        if (stats.isDirectory()) {
          structure.directories.push(entryRelativePath);
          traverse(entryPath, entryRelativePath);
        } else {
          structure.files.push(entryRelativePath);
          structure.totalFiles++;
          
          // 统计语言
          const extension = path.extname(entry).toLowerCase();
          if (extension) {
            structure.languages[extension] = (structure.languages[extension] || 0) + 1;
          }
        }
      });
    }

    traverse(codeDir);
    return structure;
  }

  // 比较代码与文献内容
  compareCodeWithLiterature(codeStructure, literatureContent) {
    const comparison = {
      mentionsInLiterature: 0,
      codeFilesMentioned: [],
      methodsMentioned: []
    };

    // 简单的比较逻辑，实际应用中可能需要更复杂的分析
    codeStructure.files.forEach(file => {
      if (literatureContent.includes(path.basename(file))) {
        comparison.mentionsInLiterature++;
        comparison.codeFilesMentioned.push(file);
      }
    });

    return comparison;
  }

  // 生成代码分析报告
  generateCodeAnalysisReport(repoInfo, codeStructure, comparison) {
    let report = `# 代码分析报告\n\n`;

    // 仓库信息
    report += `## 仓库信息\n\n`;
    if (repoInfo.github) {
      report += `- GitHub: ${repoInfo.github}\n`;
    }
    if (repoInfo.gitlab) {
      report += `- GitLab: ${repoInfo.gitlab}\n`;
    }
    if (repoInfo.other) {
      report += `- 其他: ${repoInfo.other}\n`;
    }
    report += `\n`;

    // 代码结构
    report += `## 代码结构\n\n`;
    report += `- 总文件数: ${codeStructure.totalFiles}\n`;
    report += `- 目录数: ${codeStructure.directories.length}\n`;
    report += `- 语言分布:\n`;
    Object.entries(codeStructure.languages).forEach(([ext, count]) => {
      report += `  - ${ext}: ${count} 文件\n`;
    });
    report += `\n`;

    // 与文献比较
    report += `## 与文献比较\n\n`;
    report += `- 文献中提及的代码文件数: ${comparison.mentionsInLiterature}\n`;
    if (comparison.codeFilesMentioned.length > 0) {
      report += `- 提及的文件:\n`;
      comparison.codeFilesMentioned.forEach(file => {
        report += `  - ${file}\n`;
      });
    }
    report += `\n`;

    return report;
  }

  // 完整的代码分析流程
  async analyze(literatureContent, outputDir) {
    try {
      // 提取代码仓库信息
      const repoInfo = this.extractCodeRepository(literatureContent);
      
      // 如果没有找到代码仓库，返回空报告
      if (!repoInfo.github && !repoInfo.gitlab && !repoInfo.other) {
        return "原文未提供代码仓库信息";
      }

      // 选择一个仓库URL进行克隆
      const repoUrl = repoInfo.github || repoInfo.gitlab || repoInfo.other;
      const codeDir = path.join(outputDir, 'code');
      
      // 克隆仓库
      const cloned = this.cloneRepository(repoUrl, codeDir);
      if (!cloned) {
        return "代码仓库克隆失败";
      }

      // 分析代码结构
      const codeStructure = this.analyzeCodeStructure(codeDir);
      
      // 比较代码与文献
      const comparison = this.compareCodeWithLiterature(codeStructure, literatureContent);
      
      // 生成分析报告
      const report = this.generateCodeAnalysisReport(repoInfo, codeStructure, comparison);
      
      return report;
    } catch (error) {
      console.error('代码分析错误:', error);
      return "代码分析失败";
    }
  }
}

module.exports = new CodeAnalyzer();