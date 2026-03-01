# Railway 部署错误排查

## 常见错误原因

### 1. Root Directory 配置错误

**问题**：Railway 找不到 `backend` 目录

**解决方案**：
- 如果使用 `railway.toml`，确保 `root = "backend"`
- 如果手动配置，在 Settings 中设置 Root Directory 为 `backend`

### 2. package.json 问题

**问题**：依赖安装失败

**检查**：
- `backend/package.json` 是否存在
- 依赖是否有效

### 3. 启动命令错误

**问题**：找不到 `index.js`

**解决方案**：
- 确认 `backend/index.js` 存在
- Start Command 设置为 `node index.js`

### 4. Node.js 版本问题

**问题**：Node.js 版本不兼容

**解决方案**：
在 `backend/package.json` 中添加：
```json
"engines": {
  "node": "18.x"
}
```

## 快速修复步骤

### 方法 1：使用手动配置（推荐）

1. **不要使用 railway.toml**
2. 在 Railway 面板手动设置：
   - Root Directory: `backend`
   - Start Command: `node index.js`

### 方法 2：修复配置文件

如果使用 `railway.toml`，确保内容正确：

```toml
[build]
root = "backend"

[deploy]
startCommand = "node index.js"
```

## 查看错误日志

1. 访问 Railway 项目页面
2. 点击失败的服务
3. 查看 **"Deployments"** 标签
4. 点击失败的部署
5. 查看 **"Logs"** 或 **"Build Logs"**

## 最可能的原因

根据您的项目结构，最可能的错误是：

**Railway 默认在项目根目录构建，但您的后端代码在 `backend` 子目录中**

### 解决方案

**最简单的方法**：

1. 在 Railway 项目设置中
2. 找到 **"Config as Code"** 部分
3. 设置 **Config File Path** 为：`backend/railway.json`
4. 或者手动设置 **Root Directory** 为：`backend`
