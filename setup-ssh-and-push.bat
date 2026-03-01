@echo off
chcp 65001 >nul
echo ===================================
echo 配置 Git SSH 并推送
echo ===================================
echo.

cd /d "%~dp0"

echo 步骤 1: 检查是否已有 SSH 密钥...
if exist "%USERPROFILE%\.ssh\id_rsa.pub" (
    echo SSH 密钥已存在，跳过生成步骤
    goto :check_remote
)

echo 生成 SSH 密钥...
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -N "" -f "%USERPROFILE%\.ssh\id_rsa"

:check_remote
echo.
echo 步骤 2: 查看 SSH 公钥...
echo.
echo 请复制以下公钥内容（从 ssh-rsa 开始到结束）：
echo ===================================
type "%USERPROFILE%\.ssh\id_rsa.pub"
echo ===================================
echo.

echo 步骤 3: 添加 SSH 密钥到 GitHub...
echo.
echo 1. 访问：https://github.com/settings/keys
echo 2. 点击 "New SSH key"
echo 3. 粘贴上面的公钥内容
echo 4. 点击 "Add SSH key"
echo.
pause

echo 步骤 4: 测试 SSH 连接...
ssh -T git@github.com
echo.

echo 步骤 5: 切换到 SSH 远程仓库...
git remote remove origin 2>nul
git remote add origin git@github.com:17qingxinflower/literature-analysis.git

echo.
echo 步骤 6: 推送到 GitHub...
git push -u origin main

echo.
echo ===================================
echo 完成！
echo ===================================
echo.
pause
