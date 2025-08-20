#!/bin/bash

echo "🚀 启动Agent能力模型AI评估工具..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 启动服务器
echo "🌐 启动本地服务器..."
echo "📱 请在浏览器中访问: http://localhost:3000"
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

npm start
