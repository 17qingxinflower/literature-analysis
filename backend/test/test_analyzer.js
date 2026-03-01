const literatureAnalyzer = require('../src/analyzers/literatureAnalyzer');
const path = require('path');

async function testAnalyzer() {
  try {
    const testFile = path.join(__dirname, 'sample_literature.txt');
    console.log('开始分析测试文件:', testFile);
    
    const result = await literatureAnalyzer.analyze(testFile, null);
    console.log('分析结果:');
    console.log(result);
    
    console.log('测试成功！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testAnalyzer();