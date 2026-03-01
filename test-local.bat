@echo off
chcp 65001 >nul
echo ========================================
echo   文献分析网站 - 本地测试脚本
echo ========================================
echo.

echo 提示：此脚本用于本地测试前后端连接
echo.
echo 测试步骤：
echo 1. 确保后端正在运行（端口 3001）
echo 2. 确保前端正在运行（端口 3000）
echo 3. 访问 http://localhost:3000
echo.

echo 正在检查后端健康状态...
curl -s http://localhost:3001/health

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [成功] 后端服务正常运行
) else (
    echo.
    echo [警告] 后端服务未运行
    echo 请执行：cd backend ^&^& node index.js
)

echo.
pause
