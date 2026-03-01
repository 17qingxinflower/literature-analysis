import requests

token = "eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiIyNjMwMDYxNCIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc3MjAwODg3OCwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiMTM1Njg4MDQyNTYiLCJvcGVuSWQiOm51bGwsInV1aWQiOiI2NzFlNWNkNC0xYmViLTQ3NzUtYTgyMy04ZTdkYzIyMWNlNjkiLCJlbWFpbCI6IiIsImV4cCI6MTc3OTc4NDg3OH0.0dFu6xhin-guyX0JiWg1c6yGjKWRef25p6CHGw30SNmuq1y4qgV3IPIaEEY8SfCSRDBzKJym10AVxcnrWtQXVg"

# 测试提取任务 API
url = "https://mineru.net/api/v4/extract/task"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

# 使用官方示例中的 URL
data = {
    "url": "https://cdn-mineru.openxlab.org.cn/demo/example.pdf",
    "model_version": "vlm"
}

print("正在创建解析任务...")
res = requests.post(url, headers=headers, json=data)
print(f"状态码: {res.status_code}")
print(f"响应: {res.text}")

if res.status_code == 200:
    task_id = res.json().get("data", {}).get("task_id")
    if task_id:
        print(f"任务ID: {task_id}")

        # 查询任务结果
        print("等待解析完成...")
        import time
        for i in range(30):
            time.sleep(5)
            result_url = f"https://mineru.net/api/v4/extract/task/{task_id}"
            result_res = requests.get(result_url, headers=headers)
            result_data = result_res.json().get("data", {})
            status = result_data.get("status")
            print(f"状态: {status} ({i+1}/30)")

            if status == "completed":
                print("解析完成!")
                print(f"Markdown 长度: {len(result_data.get('markdown', ''))}")
                print(f"图片数量: {len(result_data.get('images', []))}")
                break
            elif status == "failed":
                print("解析失败!")
                break
