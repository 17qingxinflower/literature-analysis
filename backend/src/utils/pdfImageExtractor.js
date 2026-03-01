const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const FormData = require('form-data');

const MINERU_API_KEY = 'eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiIyNjMwMDYxNCIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc3MjAwODg3OCwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiMTM1Njg4MDQyNTYiLCJvcGVuSWQiOm51bGwsInV1aWQiOiI2NzFlNWNkNC0xYmViLTQ3NzUtYTgyMy04ZTdkYzIyMWNlNjkiLCJlbWFpbCI6IiIsImV4cCI6MTc3OTc4NDg3OH0.0dFu6xhin-guyX0JiWg1c6yGjKWRef25p6CHGw30SNmuq1y4qgV3IPIaEEY8SfCSRDBzKJym10AVxcnrWtQXVg';
const MINERU_BASE_URL = 'https://mineru.net/api/v4';

class PDFImageExtractor {
  
  // 使用MinerU API提取图片（正确版本）
  async extractWithMinerU(pdfPath, outputDir) {
    console.log('=== 使用MinerU API提取图片 ===');
    const images = [];
    
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // 1. 上传PDF文件
      console.log('正在上传PDF到MinerU...');
      
      const fileBuffer = fs.readFileSync(pdfPath);
      const fileName = path.basename(pdfPath);
      
      const form = new FormData();
      form.append('file', fileBuffer, {
        filename: fileName,
        contentType: 'application/pdf'
      });
      
      const uploadResponse = await axios.post(`${MINERU_BASE_URL}/file/upload`, form, {
        headers: {
          'Authorization': `Bearer ${MINERU_API_KEY}`,
          ...form.getHeaders()
        },
        timeout: 120000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
      
      console.log('上传响应:', JSON.stringify(uploadResponse.data));
      
      // 获取文件URL（上传后返回的URL）
      const fileUrl = uploadResponse.data?.data?.url || uploadResponse.data?.url;
      if (!fileUrl) {
        throw new Error('上传失败，未获取到file_url: ' + JSON.stringify(uploadResponse.data));
      }
      console.log('文件URL:', fileUrl);
      
      // 2. 使用URL创建解析任务（官方示例方式）
      console.log('正在创建解析任务...');
      const parseResponse = await axios.post(`${MINERU_BASE_URL}/extract/task`, {
        url: fileUrl,
        model_version: 'vlm'
      }, {
        headers: {
          'Authorization': `Bearer ${MINERU_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('解析响应:', JSON.stringify(parseResponse.data));
      
      const taskId = parseResponse.data?.data?.task_id || parseResponse.data?.task_id;
      if (!taskId) {
        throw new Error('创建任务失败，未获取到task_id: ' + JSON.stringify(parseResponse.data));
      }
      console.log('任务ID:', taskId);
      
      // 3. 轮询获取结果
      let result;
      let attempts = 0;
      const maxAttempts = 60;
      
      console.log('等待解析完成...');
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        try {
          const statusResponse = await axios.get(`${MINERU_BASE_URL}/extract/task/${taskId}`, {
            headers: {
              'Authorization': `Bearer ${MINERU_API_KEY}`
            },
            timeout: 30000
          });
          
          result = statusResponse.data;
          // 使用 state 而不是 status，使用 success 而不是 completed
          const state = result?.data?.state || result?.state;
          
          console.log(`解析状态: ${state} (${attempts + 1}/${maxAttempts})`);
          
          if (state === 'success' || state === 'completed' || state === 'done') {
            break;
          } else if (state === 'failed' || state === 'error') {
            throw new Error('解析失败: ' + JSON.stringify(result));
          }
        } catch (e) {
          console.log('查询状态出错:', e.message);
        }
        
        attempts++;
      }
      
      // 4. 获取结果并下载图片
      if (result) {
        // 使用正确的 API 端点获取结果
        const fullResult = await axios.get(`${MINERU_BASE_URL}/extract/task/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${MINERU_API_KEY}`
          },
          timeout: 60000
        });
        
        console.log('获取到解析结果');
        const data = fullResult.data?.data || fullResult.data;
        
        // 下载图片
        if (data?.images && Array.isArray(data.images)) {
          for (let i = 0; i < Math.min(data.images.length, 10); i++) {
            const img = data.images[i];
            try {
              const imgUrl = img.url || img.path;
              if (!imgUrl) continue;
              
              const imgResponse = await axios.get(imgUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
              });
              
              const imgPath = path.join(outputDir, `mineru_img_${i}.png`);
              fs.writeFileSync(imgPath, Buffer.from(imgResponse.data));
              
              images.push({
                page: img.page || 0,
                name: `mineru_img_${i}`,
                path: imgPath,
                width: img.width || 0,
                height: img.height || 0,
                type: 'mineru'
              });
              
              console.log(`下载图片: ${imgPath}`);
            } catch (e) {
              console.log(`下载图片失败: ${e.message}`);
            }
          }
        }
        
        // 保存Markdown内容
        if (data?.markdown) {
          const mdPath = path.join(outputDir, 'content.md');
          fs.writeFileSync(mdPath, data.markdown, 'utf8');
          console.log(`Markdown已保存: ${mdPath}`);
        }
      }
      
      console.log(`MinerU提取完成: ${images.length} 张图片`);
      return images;
      
    } catch (error) {
      console.error('MinerU提取失败:', error.message);
      if (error.response) {
        console.error('响应数据:', error.response.data);
      }
      return [];
    }
  }
  
  // 使用Python提取图片
  async extractWithPython(pdfPath, outputDir) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'pdf_extractor.py');
      
      if (!fs.existsSync(scriptPath)) {
        console.log('Python脚本不存在');
        resolve([]);
        return;
      }
      
      const pythonProcess = spawn('python', [scriptPath, pdfPath, outputDir, '300']);
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.log(`Python提取失败: ${stderr}`);
          resolve([]);
          return;
        }

        console.log(`Python stdout: ${stdout}`);
        console.log(`Python stderr: ${stderr}`);
        
        try {
          // 修改正则以匹配 ---JSON_OUTPUT--- 后面直接是JSON的情况
          const jsonMatch = stdout.match(/---JSON_OUTPUT---([\s\S]*)/);
          if (jsonMatch) {
            console.log('Found JSON match, parsing...');
            const result = JSON.parse(jsonMatch[1]);
            console.log('Parsed result:', JSON.stringify(result).substring(0, 200));
            
            // 修复路径：将损坏的中文路径替换为正确的路径
            // 优先选择嵌入图片（embedded），而不是页面渲染图（page_render）
            const fixedImages = (result.images || [])
              .map((img, idx) => {
                // 提取文件名
                const fileName = img.name || `image_${idx}.png`;
                // 使用正确的输出目录路径
                const correctPath = path.join(outputDir, fileName);
                return {
                  ...img,
                  path: correctPath
                };
              })
              // 排序：优先 embedded 类型，然后按文件大小降序
              .sort((a, b) => {
                if (a.type === 'embedded' && b.type !== 'embedded') return -1;
                if (a.type !== 'embedded' && b.type === 'embedded') return 1;
                return (b.width * b.height) - (a.width * a.height);
              });
            
            resolve(fixedImages);
          } else {
            console.log('No JSON match found in stdout');
            resolve([]);
          }
        } catch (e) {
          console.log('JSON parse error:', e.message);
          resolve([]);
        }
      });
      
      pythonProcess.on('error', () => {
        resolve([]);
      });
    });
  }
  
  // 使用JavaScript提取嵌入图片
  async extractWithJS(pdfPath, outputDir) {
    const { PDFDocument } = require('pdf-lib');
    const images = [];
    
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      console.log(`PDF总页数: ${pdfDoc.getPageCount()}`);
      
      const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
      
      let imgIndex = 0;
      for (const [ref, obj] of indirectObjects) {
        try {
          if (obj && obj.get && obj.get('Subtype')) {
            const subtype = obj.get('Subtype');
            if (subtype && subtype.toString() === '/Image') {
              const width = obj.get('Width') ? parseInt(obj.get('Width').toString()) : 0;
              const height = obj.get('Height') ? parseInt(obj.get('Height').toString()) : 0;
              
              if (width > 100 && height > 100) {
                const filter = obj.get('Filter');
                let imgExt = 'png';
                let imgBytes;
                
                try {
                  const stream = obj;
                  if (stream.contents) {
                    imgBytes = stream.contents;
                    
                    if (filter) {
                      const filterStr = filter.toString();
                      if (filterStr.includes('DCTDecode')) {
                        imgExt = 'jpg';
                      }
                    }
                    
                    const imgName = `img_${imgIndex++}`;
                    const imgPath = path.join(outputDir, `${imgName}.${imgExt}`);
                    
                    fs.writeFileSync(imgPath, Buffer.from(imgBytes));
                    
                    images.push({
                      page: 0,
                      name: imgName,
                      path: imgPath,
                      width: width,
                      height: height,
                      type: 'embedded'
                    });
                    
                    console.log(`提取嵌入图片: ${imgName} (${width}x${height})`);
                  }
                } catch (e) {
                  // 忽略
                }
              }
            }
          }
        } catch (e) {
          // 忽略
        }
      }
      
      console.log(`JavaScript提取: ${images.length} 张嵌入图片`);
      return images;
    } catch (error) {
      console.error('JavaScript提取失败:', error.message);
      return [];
    }
  }
  
  // 主提取方法：优先使用MinerU
  async extractImagesFromPDF(pdfPath, outputDir) {
    console.log('=== 开始提取PDF图片 ===');
    console.log('PDF路径:', pdfPath);
    console.log('输出目录:', outputDir);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let images = [];
    
    // 直接使用 Python 提取（跳过 MinerU）
    console.log('=== 直接使用 Python 提取 ===');
    try {
      images = await this.extractWithPython(pdfPath, outputDir);
      console.log('Python提取结果:', images.length, '张图片');
    } catch (e) {
      console.log('Python提取失败:', e.message);
    }
    
    // 如果Python也失败，使用JavaScript
    if (images.length === 0) {
      try {
        images = await this.extractWithJS(pdfPath, outputDir);
      } catch (e) {
        console.log('JavaScript提取失败:', e.message);
      }
    }
    
    // 过滤并排序图片
    images = images
      .filter(img => img.width > 100 && img.height > 100)
      .sort((a, b) => (b.width * b.height) - (a.width * b.height));
    
    console.log(`=== 提取完成: ${images.length} 张有效图片 ===`);
    return images;
  }
}

module.exports = new PDFImageExtractor();
