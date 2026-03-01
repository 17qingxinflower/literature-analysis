@echo off
chcp 65001 >nul
echo ===================================
echo 推送前端修复到 GitHub
echo ===================================
echo.

cd /d "%~dp0"

echo 添加修改的文件...
git add .

echo.
echo 提交更改...
git commit -m "Fix: 移除未使用的导入"

echo.
echo 推送到 GitHub...
git push origin main

echo.
echo ===================================
echo 完成！
echo ===================================
echo.
echo Vercel 会自动重新构建...
echo.
pause
