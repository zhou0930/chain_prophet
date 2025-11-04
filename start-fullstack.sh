#!/bin/bash

# Chain Prophet 全栈启动脚本

echo "🚀 启动 Chain Prophet 全栈应用..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 未找到 package.json，请确保在项目根目录中运行此脚本"
    exit 1
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "❌ 未找到 .env 文件，请先配置环境变量"
    exit 1
fi

# 函数：启动后端
start_backend() {
    echo "🔧 启动后端服务..."
    cd /home/mitu/chain_prophet
    bun run dev &
    BACKEND_PID=$!
    echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
}

# 函数：启动前端
start_frontend() {
    echo "🎨 启动前端服务..."
    cd /home/mitu/chain_prophet/frontend
    
    # 检查前端依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 安装前端依赖..."
        npm install
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env" ]; then
        echo "📝 创建前端环境变量文件..."
        cp env.example .env
    fi
    
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
}

# 函数：清理进程
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ 后端服务已停止"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ 前端服务已停止"
    fi
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 启动服务
start_backend
sleep 3  # 等待后端启动
start_frontend

echo ""
echo "🎉 全栈应用已启动！"
echo "📍 后端 API: http://localhost:3000"
echo "📍 前端应用: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
wait
