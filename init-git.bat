@echo off
chcp 65001 >nul
echo ========================================
echo   文献分析网站 - Git 初始化脚本
echo ========================================
echo.

REM 检查 Git 是否安装
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Git，请先安装 Git
    echo 下载地址：https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] 初始化 Git 仓库...
cd /d "%~dp0"
git init

echo [2/5] 添加所有文件到暂存区...
git add .

echo [3/5] 创建初始提交...
git commit -m "Initial commit - 文献分析网站"

echo.
echo [4/5] 请在 GitHub 创建仓库后，执行以下命令：
echo.
echo     git remote add origin https://github.com/你的用户名/literature-analysis.git
echo     git branch -M main
echo     git push -u origin main
echo.

echo [5/5] 查看当前 Git 状态...
git status

echo.
echo ========================================
echo   Git 初始化完成！
echo ========================================
echo.
echo 下一步：
echo 1. 访问 https://github.com/new 创建仓库
echo 2. 执行上面的命令推送代码
echo 3. 参考 DEPLOYMENT_GUIDE.md 进行部署
echo.
pause
