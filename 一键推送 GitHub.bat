@echo off
chcp 65001 >nul
echo ===================================
echo 一键推送到 GitHub
echo ===================================
echo.

cd /d "%~dp0"

echo [1/6] 配置 Git 用户信息...
git config --global user.email "17qingxinflower@github.com"
git config --global user.name "17qingxinflower"
echo ✓ 完成
echo.

echo [2/6] 添加所有文件...
git add .
echo ✓ 完成
echo.

echo [3/6] 提交代码...
git commit -m "Initial commit: 文献分析工具"
if %errorlevel% neq 0 (
    echo ✗ 提交失败，可能是空仓库
    goto :create_branch
)
echo ✓ 完成
echo.

:create_branch
echo [4/6] 创建 main 分支...
git checkout -b main 2>nul
if %errorlevel% neq 0 (
    echo ✓ main 分支已存在，跳过
) else (
    echo ✓ 完成
)
echo.

echo [5/6] 添加远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/17qingxinflower/literature-analysis.git
echo ✓ 完成
echo.

echo [6/6] 推送到 GitHub...
echo 正在推送，请稍候...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo ✗ 推送失败！可能是网络问题
    echo.
    echo 建议：
    echo 1. 检查网络连接
    echo 2. 如果使用代理，请配置 Git 代理：
    echo    git config --global http.proxy http://127.0.0.1:7890
    echo 3. 或者使用 SSH 方式推送
    echo.
    pause
    exit /b 1
)

echo ✓ 完成
echo.
echo ===================================
echo 🎉 推送成功！
echo ===================================
echo.
echo 请访问查看您的仓库：
echo https://github.com/17qingxinflower/literature-analysis
echo.
echo 接下来请部署到 Railway 和 Vercel...
echo.
echo 部署步骤：
echo 1. 访问 https://railway.app
echo 2. 用 GitHub 登录
echo 3. 部署后端 (Root Directory: backend)
echo 4. 访问 https://vercel.com
echo 5. 部署前端 (Root Directory: frontend)
echo.
pause
