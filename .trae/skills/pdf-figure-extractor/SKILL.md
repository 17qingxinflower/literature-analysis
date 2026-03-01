---
name: "pdf-figure-extractor"
description: "Extracts figures from PDF documents by analyzing content, marking locations, and converting pages to images. Invoke when user needs to extract figures from PDFs with vector graphics."
---

# PDF Figure Extractor

This skill provides a comprehensive solution for extracting figures (especially network architecture diagrams) from PDF documents, even when they contain vector graphics that cannot be directly extracted as embedded images.

## Problem Solved

Many academic PDFs contain figures as vector graphics rather than embedded images. Traditional image extraction methods fail for these cases. This skill solves the problem by:

1. **Identifying figure locations** - Analyzing PDF content to find figure positions
2. **Converting PDF to images** - Rendering each page as a high-resolution image
3. **Precise cropping** - Extracting figures based on identified locations

## Workflow

### Step 1: Figure Location Identification

The skill first analyzes the PDF to identify potential figure locations:

1. **Text Analysis**: Search for figure captions (e.g., "Fig. 1", "Figure 1", "图1")
2. **Page Structure Analysis**: Identify regions with visual content vs. text
3. **Network Diagram Detection**: Look for keywords like:
   - "architecture", "framework", "network", "model", "pipeline"
   - "CNN", "RNN", "Transformer", "GAN"
   - "流程图", "架构图", "网络结构"
4. **Position Marking**: Record page numbers and approximate coordinates

### Step 2: PDF to Image Conversion

Convert PDF pages to high-resolution images using one of these methods:

#### Method A: Using pdf-lib (Pure JavaScript, No Dependencies)

```javascript
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function extractImages(pdfPath, outputDir) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  // Extract embedded images
  const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
  
  for (const [ref, obj] of indirectObjects) {
    if (obj && obj.get && obj.get('Subtype')?.toString() === '/Image') {
      const width = parseInt(obj.get('Width')?.toString() || '0');
      const height = parseInt(obj.get('Height')?.toString() || '0');
      
      if (width > 100 && height > 100) {
        // Save image
        const imgBytes = obj.contents;
        const filter = obj.get('Filter')?.toString();
        const ext = filter?.includes('DCTDecode') ? 'jpg' : 'png';
        
        fs.writeFileSync(`${outputDir}/img_${Date.now()}.${ext}`, Buffer.from(imgBytes));
      }
    }
  }
}
```

#### Method B: Using Python (Recommended for Vector Graphics)

```python
# install: pip install pdf2image pillow
from pdf2image import convert_from_path
from PIL import Image
import re

def extract_figures(pdf_path, output_dir):
    # Convert PDF to images
    pages = convert_from_path(pdf_path, dpi=300)
    
    for i, page in enumerate(pages):
        page.save(f'{output_dir}/page_{i+1}.png', 'PNG')
    
    return len(pages)

# For precise figure cropping, use:
def crop_figure(page_image, x, y, width, height, output_path):
    cropped = page_image.crop((x, y, x + width, y + height))
    cropped.save(output_path)
```

#### Method C: Using Poppler (Windows)

1. Download Poppler from: https://github.com/oschwartz10612/poppler-windows
2. Add to PATH
3. Use pdf2pic:

```javascript
const { fromPath } = require('pdf2pic');

const options = {
  density: 300,
  saveFilename: 'page',
  savePath: outputDir,
  format: 'png',
  width: 2000,
  height: 2000
};

const convert = fromPath(pdfPath, options);
await convert.bulk(-1); // Convert all pages
```

### Step 3: Figure Location Detection

Use LLM to analyze PDF content and identify figure locations:

```javascript
async function detectFigureLocations(pdfContent) {
  const prompt = `分析以下PDF内容，识别所有图表的位置：

请找出：
1. 所有图表的标题（如 "Figure 1", "图1", "Fig. 1"等）
2. 图表所在的页码
3. 图表类型（网络架构图、流程图、结果图表等）
4. 图表的大致位置描述

PDF内容：
${pdfContent}

以JSON格式返回：
{
  "figures": [
    {
      "caption": "Figure 1: CNN Architecture",
      "page": 3,
      "type": "network_architecture",
      "position": "top half of page"
    }
  ]
}`;

  return await callLLM(prompt);
}
```

## Integration with Literature Analysis

This skill integrates with the literature analysis workflow:

1. **Before Analysis**: Extract figures from uploaded PDF
2. **During Analysis**: Use extracted figures for:
   - Network architecture visualization
   - Method flowchart reference
   - Result chart analysis
3. **In Report**: Embed extracted figures with analysis

## Figure Types Detected

| Type | Keywords | Description |
|------|----------|-------------|
| Network Architecture | CNN, RNN, Transformer, architecture | Neural network diagrams |
| Method Flowchart | pipeline, framework, flow, 流程图 | Method process diagrams |
| Result Chart | accuracy, performance, comparison | Experimental results |
| System Diagram | system, overview, 整体架构 | System architecture |

## Practical Implementation

For the current project, we implement a hybrid approach:

### For Embedded Images
- Use pdf-lib to extract directly
- Works for JPEG/PNG embedded images

### For Vector Graphics
- Provide Python script for users
- Guide users to manually screenshot important figures
- Store figure location info in report

### Alternative: Manual Screenshot Helper

```javascript
// Generate a guide for manual screenshot
function generateScreenshotGuide(figureLocations) {
  let guide = `## 图表截图指南\n\n`;
  guide += `以下图表需要手动截图：\n\n`;
  
  for (const fig of figureLocations) {
    guide += `### ${fig.caption}\n`;
    guide += `- 位置：第 ${fig.page} 页，${fig.position}\n`;
    guide += `- 类型：${fig.type}\n`;
    guide += `- 建议截图区域：${fig.suggestedRegion}\n\n`;
  }
  
  return guide;
}
```

## Output Format

Extracted figures are saved with metadata:

```json
{
  "figures": [
    {
      "id": "fig_1",
      "type": "network_architecture",
      "page": 3,
      "caption": "Figure 1: The proposed CNN architecture",
      "path": "/output/fig_1.png",
      "width": 1200,
      "height": 800,
      "extraction_method": "embedded|converted|manual"
    }
  ]
}
```

## Limitations

1. Vector graphics require external tools (Python/Poppler)
2. Figure detection accuracy depends on PDF structure
3. Some complex layouts may require manual adjustment
4. Processing time increases with PDF size and resolution

## Recommended Setup

For best results on Windows:

1. **Install Python** (if not already installed)
2. **Install pdf2image**: `pip install pdf2image pillow`
3. **Install Poppler**: Download and add to PATH
4. Run the Python extraction script for vector graphics

## Alternative: Use Online Tools

If local setup is difficult, consider:
- Smallpdf.com (PDF to JPG)
- ILovePDF.com (PDF to Image)
- Adobe Acrobat online tools
