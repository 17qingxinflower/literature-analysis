@echo off
chcp 65001 >nul
echo ===================================
echo 推送到 GitHub
echo ===================================
echo.

cd /d "%~dp0"

echo 步骤 1: 检查 Git 仓库...
if not exist ".git" (
    echo 初始化 Git 仓库...
    git init
    echo Git 仓库初始化完成！
) else (
    echo Git 仓库已存在
)

echo.
echo 步骤 2: 添加所有文件...
git add .
echo 文件添加完成！

echo.
echo 步骤 3: 提交代码...
git commit -m "Initial commit: 文献分析工具"
echo 代码提交完成！

echo.
echo 步骤 4: 创建并切换到 main 分支...
git checkout -b main
echo main 分支创建完成！

echo.
echo 步骤 5: 添加远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/17qingxinflower/literature-analysis.git
echo 远程仓库添加完成！

echo.
echo 步骤 6: 推送到 GitHub...
git push -u origin main

echo.
echo ===================================
echo 完成！
echo ===================================
echo.
echo 接下来请执行以下步骤：
echo.
echo 1. 访问 https://railway.app
echo 2. 用 GitHub 登录
echo 3. 点击 "New Project" -^> "Deploy from GitHub repo"
echo 4. 选择 literature-analysis 仓库
echo 5. Root Directory 设置为：backend
echo 6. 添加环境变量：NODE_ENV=production
echo 7. 等待部署完成，复制生成的域名
echo.
echo 然后去 Vercel 部署前端...
echo.
pause
