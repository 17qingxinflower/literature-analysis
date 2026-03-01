@echo off
echo ===================================
echo 初始化 Git 并推送到 GitHub
echo ===================================
echo.

cd /d "%~dp0"

echo 步骤 1: 检查 Git 是否已初始化...
if not exist ".git" (
    echo 初始化 Git 仓库...
    git init
) else (
    echo Git 仓库已存在
)

echo.
echo 步骤 2: 添加所有文件到 Git...
git add .

echo.
echo 步骤 3: 提交代码...
git commit -m "Initial commit: 文献分析工具"

echo.
echo 步骤 4: 查看当前状态...
git status

echo.
echo ===================================
echo 完成！
echo ===================================
echo.
echo 接下来请手动执行以下步骤：
echo.
echo 1. 访问 https://github.com/new
echo 2. 创建仓库名：literature-analysis
echo 3. 设为 Public（公开）
echo 4. 点击 "Create repository"
echo 5. 复制页面中的推送命令并执行
echo.
echo 推送命令示例：
echo git remote add origin https://github.com/17qingxinflower/literature-analysis.git
echo git branch -M main
echo git push -u origin main
echo.
pause
