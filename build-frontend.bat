@echo off
chcp 65001 >nul
echo ========================================
echo   文献分析网站 - 前端构建脚本
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/3] 安装依赖...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo [2/3] 构建生产版本...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [错误] 构建失败
    pause
    exit /b 1
)

echo [3/3] 构建完成！
echo.
echo 构建产物位置：%~dp0frontend\build
echo.
echo ========================================
echo   前端构建完成！
echo ========================================
echo.
pause
