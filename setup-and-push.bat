@echo off
chcp 65001 >nul
echo ===================================
echo 配置 Git 用户信息并推送
echo ===================================
echo.

cd /d "%~dp0"

echo 请设置您的 Git 用户信息：
echo.

set /p email=请输入您的 GitHub 邮箱（如：123456789@qq.com）: 
set /p username=请输入您的 GitHub 用户名（如：17qingxinflower）: 

echo.
echo 配置 Git 用户信息...
git config --global user.email "%email%"
git config --global user.name "%username%"

echo.
echo 用户信息配置完成！
echo.
echo 现在开始推送...
echo.

echo 步骤 1: 添加所有文件...
git add .

echo.
echo 步骤 2: 提交代码...
git commit -m "Initial commit: 文献分析工具"

echo.
echo 步骤 3: 创建并切换到 main 分支...
git checkout -b main

echo.
echo 步骤 4: 添加远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/17qingxinflower/literature-analysis.git

echo.
echo 步骤 5: 推送到 GitHub...
git push -u origin main

echo.
echo ===================================
echo 完成！
echo ===================================
echo.
echo 请访问 https://github.com/17qingxinflower/literature-analysis 查看您的仓库
echo.
echo 接下来请部署到 Railway 和 Vercel...
echo.
pause
