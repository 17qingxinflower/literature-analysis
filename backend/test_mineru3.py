import requests
import time

token = "eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiIyNjMwMDYxNCIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc3MjAwODg3OCwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiMTM1Njg4MDQyNTYiLCJvcGVuSWQiOm51bGwsInV1aWQiOiI2NzFlNWNkNC0xYmViLTQ3NzUtYTgyMy04ZTdkYzIyMWNlNjkiLCJlbWFpbCI6IiIsImV4cCI6MTc3OTc4NDg3OH0.0dFu6xhin-guyX0JiWg1c6yGjKWRef25p6CHGw30SNmuq1y4qgV3IPIaEEY8SfCSRDBzKJym10AVxcnrWtQXVg"

url = "https://mineru.net/api/v4/extract/task"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

data = {
    "url": "https://cdn-mineru.openxlab.org.cn/demo/example.pdf",
    "model_version": "vlm"
}

print("创建任务...")
res = requests.post(url, headers=headers, json=data)
task_id = res.json().get("data", {}).get("task_id")
print(f"任务ID: {task_id}")

print("\n轮询等待完成...")
for i in range(60):
    time.sleep(5)
    result_url = f"https://mineru.net/api/v4/extract/task/{task_id}"
    result_res = requests.get(result_url, headers=headers)
    result_data = result_res.json().get("data", {})
    state = result_data.get("state")
    print(f"状态: {state} ({i+1}/60)")

    if state == "success":
        print("\n解析成功!")
        markdown = result_data.get("markdown", "")
        images = result_data.get("images", [])
        print(f"Markdown 长度: {len(markdown)}")
        print(f"图片数量: {len(images)}")
        if images:
            print(f"第一张图片: {images[0]}")
        break
    elif state == "failed":
        print(f"解析失败: {result_data.get('err_msg')}")
        break
