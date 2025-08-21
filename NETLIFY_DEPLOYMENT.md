# 🚀 Netlify部署指南

## 概述

Netlify是一个现代化的网站部署平台，支持静态网站和无服务器函数。我们将使用Netlify Functions来处理API调用。

## 免费额度

- **每月125,000次函数调用**
- **每月100GB带宽**
- **构建时间**: 每月300分钟
- **并发函数**: 最多100个

## 部署步骤

### 方法1: 使用CLI部署（推荐）

#### 步骤1: 安装Netlify CLI
```bash
npm install -g netlify-cli
```

#### 步骤2: 登录Netlify
```bash
netlify login
```

#### 步骤3: 初始化项目
```bash
netlify init
```

#### 步骤4: 设置环境变量
```bash
netlify env:set QWEN_API_KEY sk-9fb5bfd2c28c41d48324fef824e9c4e3
```

#### 步骤5: 部署项目
```bash
netlify deploy --prod
```

### 方法2: 使用GitHub集成

#### 步骤1: 推送代码到GitHub
```bash
git add .
git commit -m "Add Netlify deployment configuration"
git push origin main
```

#### 步骤2: 在Netlify控制台导入项目
1. 访问 [netlify.com](https://netlify.com)
2. 点击 "New site from Git"
3. 选择你的GitHub仓库
4. 配置构建设置：
   - **Build command**: `npm run build` (或留空)
   - **Publish directory**: `.` (根目录)
5. 点击 "Deploy site"

#### 步骤3: 设置环境变量
1. 在Netlify控制台进入你的项目
2. 点击 "Site settings" → "Environment variables"
3. 添加变量：
   - **Key**: `QWEN_API_KEY`
   - **Value**: `sk-9fb5bfd2c28c41d48324fef824e9c4e3`

## 项目结构

```
Agent_competency_model_AI_assessment/
├── index.html                 # 前端页面
├── netlify.toml              # Netlify配置
├── netlify/
│   └── functions/
│       └── qwen.js           # API函数
├── package.json              # 项目依赖
└── README.md                 # 项目说明
```

## 配置说明

### netlify.toml
```toml
[build]
  publish = "."                    # 发布目录
  functions = "netlify/functions"  # 函数目录

[build.environment]
  NODE_VERSION = "18"              # Node.js版本

[[redirects]]
  from = "/api/*"                  # API路由重定向
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"                      # SPA路由重定向
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"         # 函数打包工具
```

### netlify/functions/qwen.js
- 处理 `/api/qwen` 请求
- 代理到阿里云通义千问API
- 支持CORS
- 错误处理和日志记录

## 本地测试

### 安装Netlify CLI
```bash
npm install -g netlify-cli
```

### 启动本地开发服务器
```bash
netlify dev
```

### 测试API
```bash
curl -X POST http://localhost:8888/.netlify/functions/qwen \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-turbo","input":{"messages":[{"role":"user","content":"测试"}]}}'
```

## 环境变量

### 必需的环境变量
- `QWEN_API_KEY`: 阿里云通义千问API密钥

### 设置环境变量
```bash
# 使用CLI设置
netlify env:set QWEN_API_KEY sk-9fb5bfd2c28c41d48324fef824e9c4e3

# 查看环境变量
netlify env:list

# 删除环境变量
netlify env:unset QWEN_API_KEY
```

## 故障排除

### 常见问题

#### 1. 函数调用失败
**症状**: 返回500错误
**解决方案**:
- 检查环境变量是否正确设置
- 查看函数日志: `netlify functions:logs`
- 确认API密钥有效

#### 2. CORS错误
**症状**: 浏览器控制台显示CORS错误
**解决方案**:
- 确认函数正确设置了CORS头
- 检查请求方法是否为POST

#### 3. 路由不工作
**症状**: 页面显示404
**解决方案**:
- 检查 `netlify.toml` 中的重定向规则
- 确认 `index.html` 在根目录

#### 4. 构建失败
**症状**: 部署时构建失败
**解决方案**:
- 检查 `package.json` 中的依赖
- 确认所有文件都已提交到Git

### 调试技巧

#### 查看函数日志
```bash
netlify functions:logs
```

#### 本地测试函数
```bash
netlify dev
```

#### 查看部署状态
```bash
netlify status
```

#### 重新部署
```bash
netlify deploy --prod
```

## 性能优化

### 函数优化
- 使用 `node_bundler = "esbuild"` 加快构建
- 合理设置函数超时时间
- 避免在函数中执行耗时操作

### 缓存策略
- 利用Netlify的CDN缓存
- 设置适当的缓存头
- 使用函数缓存减少重复计算

## 监控和分析

### 查看使用情况
- 在Netlify控制台查看函数调用次数
- 监控带宽使用情况
- 查看错误率和响应时间

### 设置通知
- 配置部署通知
- 设置错误告警
- 监控函数性能

## 成本控制

### 免费额度使用
- 每月125,000次函数调用
- 合理使用缓存减少函数调用
- 监控使用情况避免超出免费额度

### 升级计划
- 如果超出免费额度，考虑升级到付费计划
- 付费计划从$19/月起
- 包含更多函数调用和带宽

## 安全考虑

### API密钥安全
- 不要在代码中硬编码API密钥
- 使用环境变量存储敏感信息
- 定期轮换API密钥

### 访问控制
- 设置适当的CORS策略
- 限制函数访问权限
- 监控异常访问

## 总结

Netlify是一个优秀的部署平台，特别适合静态网站和无服务器函数。通过以上步骤，您可以成功部署您的应用并享受Netlify的免费服务。

### 优势
- ✅ 部署简单快速
- ✅ 免费额度充足
- ✅ 全球CDN
- ✅ 自动HTTPS
- ✅ 实时预览

### 注意事项
- ⚠️ 函数有冷启动时间
- ⚠️ 免费版有调用次数限制
- ⚠️ 需要正确配置环境变量
