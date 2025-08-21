# 🚀 部署指南

## Vercel部署 (推荐)

### 方法1: 使用CLI部署

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel --prod
   ```

### 方法2: 使用GitHub集成

1. **推送代码到GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **在Vercel控制台导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 点击 "Deploy"

### 设置环境变量

在Vercel控制台设置以下环境变量：

- **QWEN_API_KEY**: `sk-9fb5bfd2c28c41d48324fef824e9c4e3`

### 免费额度

- **带宽**: 每月100GB
- **函数执行时间**: 每月1000小时
- **构建时间**: 每月6000分钟

## Railway部署

### 步骤

1. **访问Railway**
   - 访问 [railway.app](https://railway.app)
   - 使用GitHub账号登录

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **设置环境变量**
   - 在项目设置中添加 `QWEN_API_KEY`

### 免费额度

- **每月$5额度**
- 约500小时运行时间

## Render部署

### 步骤

1. **访问Render**
   - 访问 [render.com](https://render.com)
   - 使用GitHub账号登录

2. **创建Web Service**
   - 点击 "New +"
   - 选择 "Web Service"
   - 连接GitHub仓库

3. **配置设置**
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node

4. **设置环境变量**
   - 添加 `QWEN_API_KEY`

### 免费额度

- **每月750小时运行时间**
- 免费版有休眠机制（15分钟无请求后休眠）

## Netlify部署

### 步骤

1. **访问Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 使用GitHub账号登录

2. **创建函数**
   - 创建 `netlify/functions/api.js` 文件
   - 将API逻辑移到函数中

3. **部署**
   - 连接GitHub仓库
   - 自动部署

### 免费额度

- **每月125,000次函数调用**
- **每月100GB带宽**

## 本地测试

```bash
# 启动本地服务器
node server.js

# 访问应用
open http://localhost:3000
```

## 故障排除

### 常见问题

1. **API调用失败**
   - 检查环境变量是否正确设置
   - 确认API Key有效

2. **CORS错误**
   - 确保服务器正确配置了CORS
   - 检查请求头设置

3. **部署失败**
   - 检查 `package.json` 中的依赖
   - 确认所有文件都已提交

### 调试技巧

1. **查看日志**
   - Vercel: 在控制台查看Function Logs
   - Railway: 在Deployments页面查看日志
   - Render: 在Logs页面查看实时日志

2. **测试API端点**
   ```bash
   curl -X POST https://your-app.vercel.app/api/qwen \
     -H "Content-Type: application/json" \
     -d '{"model":"qwen-turbo","input":{"messages":[{"role":"user","content":"测试"}]}}'
   ```

## 成本对比

| 平台 | 免费额度 | 超出费用 | 推荐指数 |
|------|----------|----------|----------|
| Vercel | 100GB带宽, 1000小时函数 | $20/月 | ⭐⭐⭐⭐⭐ |
| Railway | $5/月额度 | 按使用量计费 | ⭐⭐⭐⭐ |
| Render | 750小时运行 | $7/月起 | ⭐⭐⭐⭐ |
| Netlify | 125K函数调用 | $19/月起 | ⭐⭐⭐ |

## 推荐方案

**个人项目**: Vercel (免费额度充足，部署简单)
**小型团队**: Railway (性价比高，功能完整)
**企业项目**: Render (稳定性好，支持更多服务)
