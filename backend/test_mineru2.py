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
print(f"响应: {res.json()}")

task_id = res.json().get("data", {}).get("task_id")
print(f"任务ID: {task_id}")

print("\n等待10秒后查询...")
time.sleep(10)

result_url = f"https://mineru.net/api/v4/extract/task/{task_id}"
result_res = requests.get(result_url, headers=headers)
print(f"查询响应: {result_res.json()}")
