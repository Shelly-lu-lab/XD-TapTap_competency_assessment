#!/bin/bash

echo "🚀 开始部署到Vercel..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录Vercel..."
    vercel login
fi

# 部署项目
echo "📤 部署项目到Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo "🌐 您的应用现在可以通过Vercel提供的URL访问"
echo "📝 记得在Vercel控制台设置环境变量 QWEN_API_KEY"
