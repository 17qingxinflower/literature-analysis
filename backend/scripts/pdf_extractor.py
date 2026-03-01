#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF图片提取工具
用于从PDF中提取图片，包括矢量图形（通过将PDF页面转换为图片）
"""

import os
import sys
import json
import re
from pathlib import Path

try:
    from pdf2image import convert_from_path
    from PIL import Image
    HAS_PDF2IMAGE = True
except ImportError:
    HAS_PDF2IMAGE = False
    print("Warning: pdf2image not installed. Install with: pip install pdf2image pillow")

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("Warning: PIL not installed")

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
    print("PyMuPDF loaded successfully")
except ImportError:
    HAS_PYMUPDF = False
    print("Warning: PyMuPDF not installed")


def extract_with_pymupdf(pdf_path, output_dir, dpi=300):
    """使用PyMuPDF提取PDF中的图片和渲染页面"""
    images_info = []

    if not HAS_PYMUPDF:
        return images_info

    # 确保路径使用正确的编码
    pdf_path = str(pdf_path)
    output_dir = str(output_dir)
    
    doc = fitz.open(pdf_path)
    print(f"PDF pages: {len(doc)}")

    for page_num in range(len(doc)):
        page = doc[page_num]

        # 1. 提取嵌入的图片
        image_list = page.get_images(full=True)
        print(f"Page {page_num+1}: Found {len(image_list)} embedded images")

        for img_index, img in enumerate(image_list):
            try:
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]

                # 只保存较大的图片
                if len(image_bytes) > 5000:  # 大于5KB
                    img_filename = f"embedded_p{page_num+1}_{img_index}.{image_ext}"
                    img_path = os.path.join(output_dir, img_filename)

                    with open(img_path, 'wb') as f:
                        f.write(image_bytes)

                    # 获取图片尺寸
                    pil_img = Image.open(img_path)
                    width, height = pil_img.size

                    images_info.append({
                        "page": page_num + 1,
                        "name": img_filename,
                        "path": img_path,
                        "width": width,
                        "height": height,
                        "type": "embedded"
                    })
                    print(f"Extracted embedded image: {img_filename} ({width}x{height})")
            except Exception as e:
                print(f"Failed to extract image: {e}")

        # 2. 将页面渲染为图片（用于矢量图形）
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat)

        page_filename = f"page_{page_num+1}.png"
        page_path = os.path.join(output_dir, page_filename)
        pix.save(page_path)

        images_info.append({
            "page": page_num + 1,
            "name": page_filename,
            "path": page_path,
            "width": pix.width,
            "height": pix.height,
            "type": "page_render"
        })
        print(f"Rendered page {page_num+1}: {page_filename} ({pix.width}x{pix.height})")

    doc.close()
    return images_info


def extract_with_pdf2image(pdf_path, output_dir, dpi=300):
    """使用pdf2image将PDF页面转换为图片"""
    images_info = []

    if not HAS_PDF2IMAGE:
        return images_info

    try:
        pages = convert_from_path(pdf_path, dpi=dpi)

        for i, page in enumerate(pages):
            page_filename = f"page_{i+1}.png"
            page_path = os.path.join(output_dir, page_filename)
            page.save(page_path, 'PNG')

            width, height = page.size
            images_info.append({
                "page": i + 1,
                "name": page_filename,
                "path": page_path,
                "width": width,
                "height": height,
                "type": "page_render"
            })
            print(f"Converted page {i+1}: {page_filename} ({width}x{height})")
    except Exception as e:
        print(f"pdf2image error: {e}")

    return images_info


def detect_figures_in_text(pdf_path):
    """检测PDF文本中的图表引用"""
    figures = []

    if HAS_PYMUPDF:
        doc = fitz.open(pdf_path)
        full_text = ""

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            full_text += f"\n--- Page {page_num+1} ---\n{text}"

        doc.close()

        # 匹配图表引用
        patterns = [
            r'(Figure|Fig\.|图)\s*(\d+)[\s:：]([^\n]+)',
            r'(Table|表)\s*(\d+)[\s:：]([^\n]+)',
        ]

        for pattern in patterns:
            matches = re.finditer(pattern, full_text, re.IGNORECASE)
            for match in matches:
                figures.append({
                    "type": match.group(1),
                    "number": match.group(2),
                    "caption": match.group(3).strip(),
                    "full_match": match.group(0)
                })

    return figures


def main():
    if len(sys.argv) < 3:
        print("Usage: python pdf_extractor.py <pdf_path> <output_dir> [dpi]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]
    dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 300

    # 创建输出目录
    os.makedirs(output_dir, exist_ok=True)

    print(f"Processing PDF: {pdf_path}")
    print(f"Output directory: {output_dir}")
    print(f"DPI: {dpi}")
    print(f"Has PyMuPDF: {HAS_PYMUPDF}")
    print(f"Has pdf2image: {HAS_PDF2IMAGE}")

    all_images = []

    # 优先使用PyMuPDF
    if HAS_PYMUPDF:
        print("\nUsing PyMuPDF for extraction...")
        all_images = extract_with_pymupdf(pdf_path, output_dir, dpi)
    elif HAS_PDF2IMAGE:
        print("\nUsing pdf2image for conversion...")
        all_images = extract_with_pdf2image(pdf_path, output_dir, dpi)
    else:
        print("\nError: No PDF processing library available!")
        print("Please install one of the following:")
        print("  pip install PyMuPDF")
        print("  pip install pdf2image pillow")
        sys.exit(1)

    # 检测图表引用
    figures = detect_figures_in_text(pdf_path)

    # 输出结果
    result = {
        "total_images": len(all_images),
        "images": all_images,
        "detected_figures": figures
    }

    result_path = os.path.join(output_dir, "extraction_result.json")
    with open(result_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nExtraction complete!")
    print(f"Total images extracted: {len(all_images)}")
    print(f"Detected figure references: {len(figures)}")
    print(f"Result saved to: {result_path}")

    # 输出JSON供Node.js读取（使用ASCII编码避免中文乱码）
    print("\n---JSON_OUTPUT---")
    print(json.dumps(result, ensure_ascii=True))


if __name__ == "__main__":
    main()
