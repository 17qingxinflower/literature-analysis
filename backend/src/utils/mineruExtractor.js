const axios = require('axios');
const fs = require('fs');
const path = require('path');

const MINERU_API_KEY = 'eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiIyNjMwMDYxNCIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc3MjAwODg3OCwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiMTM1Njg4MDQyNTYiLCJvcGVuSWQiOm51bGwsInV1aWQiOiI2NzFlNWNkNC0xYmViLTQ3NzUtYTgyMy04ZTdkYzIyMWNlNjkiLCJlbWFpbCI6IiIsImV4cCI6MTc3OTc4NDg3OH0.0dFu6xhin-guyX0JiWg1c6yGjKWRef25p6CHGw30SNmuq1y4qgV3IPIaEEY8SfCSRDBzKJym10AVxcnrWtQXVg';
const MINERU_BASE_URL = 'https://mineru.net/api/v4';

class MinerUExtractor {
  
  // 上传PDF文件
  async uploadPDF(pdfPath) {
    try {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(pdfPath);
      const fileName = path.basename(pdfPath);
      
      console.log(`正在上传PDF到MinerU: ${fileName}`);
      
      const response = await axios.post(`${MINERU_BASE_URL}/file/upload`, {
        file: {
          value: fileBuffer,
          options: {
            filename: fileName,
            contentType: 'application/pdf'
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${MINERU_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });
      
      console.log('上传响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('上传PDF失败:', error.message);
      throw error;
    }
  }
  
  // 解析PDF
  async parsePDF(fileId) {
    try {
      console.log(`正在解析PDF: ${fileId}`);
      
      const response = await axios.post(`${MINERU_BASE_URL}/parse`, {
        file_id: fileId,
        parse_method: 'auto'
      }, {
        headers: {
          'Authorization': `Bearer ${MINERU_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });
      
      console.log('解析响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('解析PDF失败:', error.message);
      throw error;
    }
  }
  
  // 获取解析结果
  async getResult(taskId) {
    try {
      const response = await axios.get(`${MINERU_BASE_URL}/result/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${MINERU_API_KEY}`
        },
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error('获取结果失败:', error.message);
      throw error;
    }
  }
  
  // 下载图片
  async downloadImage(imageUrl, outputPath) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${MINERU_API_KEY}`
        },
        timeout: 30000
      });
      
      fs.writeFileSync(outputPath, Buffer.from(response.data));
      console.log(`图片已保存: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('下载图片失败:', error.message);
      throw error;
    }
  }
  
  // 完整的PDF提取流程
  async extractFromPDF(pdfPath, outputDir) {
    const images = [];
    
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // 1. 上传PDF
      const uploadResult = await this.uploadPDF(pdfPath);
      const fileId = uploadResult.data?.file_id || uploadResult.file_id;
      
      if (!fileId) {
        throw new Error('上传失败，未获取到file_id');
      }
      
      // 2. 解析PDF
      const parseResult = await this.parsePDF(fileId);
      const taskId = parseResult.data?.task_id || parseResult.task_id;
      
      if (!taskId) {
        throw new Error('解析失败，未获取到task_id');
      }
      
      // 3. 轮询获取结果
      let result;
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        result = await this.getResult(taskId);
        
        if (result.status === 'completed' || result.data?.status === 'completed') {
          break;
        }
        
        attempts++;
        console.log(`等待解析完成... (${attempts}/${maxAttempts})`);
      }
      
      // 4. 提取图片
      const markdown = result.data?.markdown || result.markdown || '';
      const imagesList = result.data?.images || result.images || [];
      
      for (let i = 0; i < imagesList.length; i++) {
        const img = imagesList[i];
        try {
          const imgPath = path.join(outputDir, `mineru_img_${i}.png`);
          await this.downloadImage(img.url || img.path, imgPath);
          
          images.push({
            page: img.page || 0,
            name: `mineru_img_${i}`,
            path: imgPath,
            width: img.width || 0,
            height: img.height || 0,
            type: 'mineru'
          });
        } catch (e) {
          console.error(`下载图片失败: ${e.message}`);
        }
      }
      
      console.log(`MinerU提取完成: ${images.length} 张图片`);
      return {
        images,
        markdown
      };
      
    } catch (error) {
      console.error('MinerU提取失败:', error.message);
      return { images: [], markdown: '' };
    }
  }
}

module.exports = new MinerUExtractor();
