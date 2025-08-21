#!/bin/bash

echo "🚀 开始部署到Netlify..."

# 检查是否安装了Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "📦 安装Netlify CLI..."
    npm install -g netlify-cli
fi

# 检查是否已登录
if ! netlify status &> /dev/null; then
    echo "🔐 请先登录Netlify..."
    netlify login
fi

# 初始化Netlify项目（如果还没有初始化）
if [ ! -f ".netlify/state.json" ]; then
    echo "🔧 初始化Netlify项目..."
    netlify init
fi

# 部署项目
echo "📤 部署项目到Netlify..."
netlify deploy --prod

echo "✅ 部署完成！"
echo "🌐 您的应用现在可以通过Netlify提供的URL访问"
echo "📝 记得在Netlify控制台设置环境变量 QWEN_API_KEY"
echo "🔧 设置环境变量命令: netlify env:set QWEN_API_KEY sk-9fb5bfd2c28c41d48324fef824e9c4e3"
