@echo off
echo ===================================
echo Push all changes to GitHub
echo ===================================
echo.

cd /d "%~dp0"

echo Add all changes...
git add .

echo.
echo Commit changes...
git commit -m "feat: add bilingual README and improve features"

echo.
echo Push to GitHub...
git push origin main

echo.
echo ===================================
echo Done!
echo ===================================
echo.
echo Visit: https://github.com/17qingxinflower/literature-analysis
echo.
pause
