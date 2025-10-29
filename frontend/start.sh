#!/bin/bash

# Chain Prophet Frontend 启动脚本

echo "🚀 启动 Chain Prophet Frontend..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查是否存在 package.json
if [ ! -f "package.json" ]; then
    echo "❌ 未找到 package.json，请确保在正确的目录中运行此脚本"
    exit 1
fi

# 检查是否存在 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "✅ 已创建 .env 文件，请根据需要修改配置"
fi

# 启动开发服务器
echo "🎯 启动开发服务器..."
echo "📍 应用将在 http://localhost:3001 启动"
echo "🔗 确保后端服务在 http://localhost:3000 运行"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
