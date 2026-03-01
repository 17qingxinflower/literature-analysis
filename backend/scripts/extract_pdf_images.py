import sys
import os
from spire.pdf.common import *
from spire.pdf import *

def extract_images_from_pdf(file_path, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder, exist_ok=True)

    doc = PdfDocument()
    doc.LoadFromFile(file_path)

    images = []
    image_count = 0

    # 使用正确的方法提取图片
    for i in range(doc.Pages.Count):
        page = doc.Pages.get_Item(i)

        # 尝试不同的方法
        try:
            # 方法1: 使用 GetImages
            images_list = page.GetImages()
            if images_list:
                print(f"页面 {i+1}: 发现 {len(images_list)} 张图片 (方法1)")
                for img in images_list:
                    image_count += 1
                    image_path = os.path.join(output_folder, f"image_{i+1}_{image_count}.png")

                    width = img.Width if hasattr(img, 'Width') else 0
                    height = img.Height if hasattr(img, 'Height') else 0

                    img.Save(image_path, ImageFormat.get_Png())

                    images.append({
                        "path": image_path,
                        "page": i + 1,
                        "width": width,
                        "height": height
                    })
                    print(f"  保存: {image_path} ({width}x{height})")
        except Exception as e1:
            try:
                # 方法2: 遍历页面对象
                for obj in page.Objects:
                    if isinstance(obj, PdfPictureBox):
                        image_count += 1
                        image_path = os.path.join(output_folder, f"image_{i+1}_{image_count}.png")

                        img = obj.Image
                        width = img.PhysicalDimension.Width if img else 0
                        height = img.PhysicalDimension.Height if img else 0

                        if img:
                            img.Save(image_path, ImageFormat.get_Png())

                            images.append({
                                "path": image_path,
                                "page": i + 1,
                                "width": int(width),
                                "height": int(height)
                            })
                            print(f"  保存: {image_path}")
            except Exception as e2:
                pass

    doc.Close()
    return images

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python extract_pdf_images.py <pdf文件路径> <输出目录>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_folder = sys.argv[2]

    if not os.path.exists(pdf_path):
        print(f"文件不存在: {pdf_path}")
        sys.exit(1)

    print(f"从 PDF 提取图片: {pdf_path}")
    print(f"输出目录: {output_folder}")

    images = extract_images_from_pdf(pdf_path, output_folder)

    print(f"\n共提取 {len(images)} 张图片")

    # 输出 JSON 格式供 Node.js 读取
    import json
    result = {
        "success": True,
        "count": len(images),
        "images": images
    }
    print("RESULT_JSON:" + json.dumps(result))
