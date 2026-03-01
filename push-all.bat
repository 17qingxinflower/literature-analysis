@echo off
echo ===================================
echo Push README updates to GitHub
echo ===================================
echo.

cd /d "%~dp0"

git add .
git commit -m "docs: user-friendly README"
git push origin main

echo.
echo Done! Visit: https://github.com/17qingxinflower/literature-analysis
echo.
pause
