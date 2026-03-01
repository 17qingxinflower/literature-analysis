import requests
import sys
import os

# 检查参数
if len(sys.argv) < 2:
    print("用法: python test_mineru_pdf.py <pdf文件路径>")
    sys.exit(1)

pdf_path = sys.argv[1]
if not os.path.exists(pdf_path):
    print(f"文件不存在: {pdf_path}")
    sys.exit(1)

token = "eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiIyNjMwMDYxNCIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc3MjAwODg3OCwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiMTM1Njg4MDQyNTYiLCJvcGVuSWQiOm51bGwsInV1aWQiOiI2NzFlNWNkNC0xYmViLTQ3NzUtYTgyMy04ZTdkYzIyMWNlNjkiLCJlbWFpbCI6IiIsImV4cCI6MTc3OTc4NDg3OH0.0dFu6xhin-guyX0JiWg1c6yGjKWRef25p6CHGw30SNmuq1y4qgV3IPIaEEY8SfCSRDBzKJym10AVxcnrWtQXVg"

print(f"测试文件: {pdf_path}")
print(f"文件大小: {os.path.getsize(pdf_path)} bytes")

# 尝试获取 API 文档
print("\n=== 尝试访问 API 文档 ===")
doc_urls = [
    "https://mineru.net/api/v4",
    "https://mineru.net/api/v4/docs",
    "https://mineru.net/api/v4/file/upload",
]

headers = {
    "Authorization": f"Bearer {token}"
}

for url in doc_urls:
    try:
        res = requests.get(url, headers=headers, timeout=10)
        print(f"{url}: {res.status_code}")
        if res.status_code == 200:
            print(f"  内容: {res.text[:200]}")
    except Exception as e:
        print(f"{url}: 错误 - {e}")

# 尝试使用 extract/task 直接上传文件
print("\n=== 尝试直接使用 extract/task ===")
import base64

with open(pdf_path, "rb") as f:
    file_content = base64.b64encode(f.read()).decode('utf-8')

# 尝试不同格式
formats = [
    {
        "url": "https://mineru.openxlab.org.cn/extract",
        "file": file_content,
        "file_name": os.path.basename(pdf_path)
    },
    {
        "url": "https://mineru.openxlab.org.cn/extract/task",
        "file": file_content,
        "file_name": os.path.basename(pdf_path)
    }
]

for fmt in formats:
    try:
        print(f"\n尝试: {fmt['url']}")
        data = {
            "file": fmt["file"],
            "file_name": fmt["file_name"],
            "model_version": "vlm"
        }
        res = requests.post(fmt["url"], headers=headers, json=data, timeout=30)
        print(f"状态: {res.status_code}, 响应: {res.text[:200]}")
    except Exception as e:
        print(f"错误: {e}")
