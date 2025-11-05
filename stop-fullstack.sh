#!/bin/bash

# Chain Prophet 全栈关闭脚本
# 使用方法:
#   ./stop-fullstack.sh          # 使用强力模式（默认）
#   ./stop-fullstack.sh -f       # 使用强力模式（明确指定）
#   ./stop-fullstack.sh --force  # 使用强力模式（明确指定）
#   ./stop-fullstack.sh --normal # 使用正常模式（逐步关闭）

# 解析命令行参数
FORCE_MODE=true  # 默认使用强力模式
if [ "$1" == "--normal" ] || [ "$1" == "-n" ]; then
    FORCE_MODE=false
elif [ "$1" == "-f" ] || [ "$1" == "--force" ] || [ "$1" == "force" ] || [ "$1" == "" ]; then
    FORCE_MODE=true
fi

echo "🛑 正在关闭 Chain Prophet 全栈应用..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "⚠️  未找到 package.json，但将继续执行关闭操作..."
fi

# 函数：通过进程名查找并关闭进程（支持多个进程）
kill_by_name() {
    local process_name=$1
    local description=$2
    
    # 查找所有匹配的进程（包括子进程）
    local pids=$(pgrep -f "$process_name" 2>/dev/null)
    
    if [ -z "$pids" ]; then
        echo "ℹ️  未找到运行中的 $description"
        return 0
    fi
    
    # 显示找到的所有进程
    echo "🔍 找到 $description 进程 (共 $(echo $pids | wc -w) 个):"
    for pid in $pids; do
        ps -p $pid -o pid,cmd --no-headers 2>/dev/null | while read line; do
            echo "   PID $pid: $line"
        done
    done
    
    # 查找所有相关进程及其子进程
    local all_pids="$pids"
    for pid in $pids; do
        # 查找子进程
        local children=$(pgrep -P $pid 2>/dev/null)
        if [ ! -z "$children" ]; then
            echo "   📦 PID $pid 的子进程: $children"
            all_pids="$all_pids $children"
        fi
    done
    
    # 去重并排序
    all_pids=$(echo $all_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    echo "🔄 正在终止 $description 及其所有子进程 (共 $(echo $all_pids | wc -w) 个进程)..."
    
    # 先尝试优雅终止
    for pid in $all_pids; do
        kill $pid 2>/dev/null
    done
    
    # 等待进程结束
    sleep 3
    
    # 检查是否还有进程在运行，如果有则强制终止
    local remaining_pids=$(pgrep -f "$process_name" 2>/dev/null)
    if [ ! -z "$remaining_pids" ]; then
        echo "⚠️  检测到仍有进程在运行，强制终止..."
        for pid in $remaining_pids; do
            # 也强制终止子进程
            local children=$(pgrep -P $pid 2>/dev/null)
            if [ ! -z "$children" ]; then
                kill -9 $children 2>/dev/null
            fi
            kill -9 $pid 2>/dev/null
        done
        sleep 2
    fi
    
    # 再次检查
    local final_check=$(pgrep -f "$process_name" 2>/dev/null)
    if [ -z "$final_check" ]; then
        echo "✅ $description 已完全关闭（所有进程和子进程）"
    else
        echo "❌ $description 仍有进程未能关闭: $final_check"
        return 1
    fi
}

# 函数：通过端口查找并关闭进程（支持多个进程占用同一端口）
kill_by_port() {
    local port=$1
    local description=$2
    
    # 查找所有占用端口的进程（可能多个）
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -z "$pids" ]; then
        echo "ℹ️  端口 $port ($description) 未被占用"
        return 0
    fi
    
    # 显示找到的所有进程
    local pid_count=$(echo $pids | wc -w)
    echo "🔍 找到占用端口 $port ($description) 的进程 (共 $pid_count 个):"
    
    # 收集所有需要关闭的进程（包括子进程）
    local all_pids="$pids"
    for pid in $pids; do
        ps -p $pid -o pid,cmd --no-headers 2>/dev/null | while read line; do
            echo "   PID $pid: $line"
        done
        
        # 查找子进程
        local children=$(pgrep -P $pid 2>/dev/null)
        if [ ! -z "$children" ]; then
            echo "   📦 PID $pid 的子进程: $children"
            all_pids="$all_pids $children"
        fi
    done
    
    # 去重并排序
    pids=$(echo $all_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    echo "🔄 正在终止占用端口 $port 的所有进程 (共 $(echo $pids | wc -w) 个进程)..."
    
    # 先尝试优雅终止
    for pid in $pids; do
        kill $pid 2>/dev/null
    done
    
    # 等待进程结束
    sleep 3
    
    # 检查是否还有进程占用端口，如果有则强制终止
    local remaining_pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$remaining_pids" ]; then
        echo "⚠️  检测到仍有进程占用端口，强制终止..."
        for pid in $remaining_pids; do
            # 也强制终止子进程
            local children=$(pgrep -P $pid 2>/dev/null)
            if [ ! -z "$children" ]; then
                kill -9 $children 2>/dev/null
            fi
            kill -9 $pid 2>/dev/null
        done
        sleep 2
    fi
    
    # 再次检查
    local final_check=$(lsof -ti:$port 2>/dev/null)
    if [ -z "$final_check" ]; then
        echo "✅ 端口 $port ($description) 已释放（所有进程已关闭）"
    else
        echo "❌ 端口 $port ($description) 仍有进程占用: $final_check"
        return 1
    fi
}

# 函数：强力关闭所有相关进程（备用方法）
force_kill_all() {
    echo "🔨 使用强力方法关闭所有相关进程..."
    
    # 定义所有需要匹配的模式
    local patterns=(
        "bun.*dev"
        "elizaos.*dev"
        "elizaos.*start"
        "bun.*run.*dev"
        "node.*elizaos"
        "node.*chain_prophet"
        "vite"
        "npm.*dev"
        "npm.*run.*dev"
        "node.*vite"
        "node.*frontend"
    )
    
    local total_killed=0
    
    for pattern in "${patterns[@]}"; do
        local pids=$(pgrep -f "$pattern" 2>/dev/null)
        if [ ! -z "$pids" ]; then
            echo "   找到匹配 '$pattern' 的进程: $pids"
            for pid in $pids; do
                # 也查找并关闭子进程
                local children=$(pgrep -P $pid 2>/dev/null)
                if [ ! -z "$children" ]; then
                    kill -9 $children 2>/dev/null
                fi
                kill -9 $pid 2>/dev/null
                total_killed=$((total_killed + 1))
            done
        fi
    done
    
    if [ $total_killed -gt 0 ]; then
        echo "✅ 强力关闭完成，共关闭 $total_killed 个进程"
        sleep 2
    else
        echo "ℹ️  未找到需要关闭的进程"
    fi
}

# 函数：关闭 Docker 容器（如果存在）
stop_docker() {
    if ! command -v docker &> /dev/null; then
        echo "ℹ️  Docker 未安装，跳过 Docker 容器检查"
        return 0
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "ℹ️  docker-compose 未安装，跳过 Docker 容器检查"
        return 0
    fi
    
    # 检查是否有 docker-compose.yaml 文件
    if [ ! -f "docker-compose.yaml" ]; then
        echo "ℹ️  未找到 docker-compose.yaml，跳过 Docker 容器检查"
        return 0
    fi
    
    echo "🐳 检查 Docker 容器..."
    
    # 检查是否有运行中的容器
    local containers=$(docker-compose ps -q 2>/dev/null)
    
    if [ -z "$containers" ]; then
        echo "ℹ️  没有运行中的 Docker 容器"
        return 0
    fi
    
    echo "🔍 找到运行中的 Docker 容器:"
    docker-compose ps 2>/dev/null
    
    echo "🔄 正在停止 Docker 容器..."
    docker-compose down 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Docker 容器已停止"
    else
        echo "⚠️  Docker 容器停止失败，请手动检查"
    fi
}

# 主执行流程
echo ""
echo "=" | head -c 50
echo ""

# 如果使用强力模式，直接执行强力关闭
if [ "$FORCE_MODE" == "true" ]; then
    echo "🔨 使用强力模式直接关闭所有相关进程..."
    echo ""
    force_kill_all
    
    # 关闭端口占用的进程
    echo ""
    echo "--- 关闭端口占用 ---"
    kill_by_port 3000 "后端端口"
    kill_by_port 3001 "前端端口"
    
    # 关闭 Docker 容器
    echo ""
    echo "--- Docker 容器检查 ---"
    stop_docker
else
    echo "开始关闭流程（正常模式）..."
    echo ""
    
    # 1. 关闭后端进程（通过进程名，包括所有可能的变体）
    echo "--- 关闭后端服务 ---"
    kill_by_name "bun.*dev\|elizaos.*dev\|elizaos.*start\|bun.*run.*dev" "后端服务 (bun/elizaos)"
    kill_by_name "node.*elizaos\|node.*chain_prophet" "后端服务 (node)"
    
    # 2. 关闭前端进程（通过进程名，包括所有可能的变体）
    echo ""
    echo "--- 关闭前端服务 ---"
    kill_by_name "vite\|npm.*dev\|npm.*run.*dev" "前端服务 (vite/npm)"
    kill_by_name "node.*vite\|node.*frontend" "前端服务 (node)"
    
    # 3. 通过端口关闭进程（更可靠的方法）
    echo ""
    echo "--- 通过端口检查 ---"
    kill_by_port 3000 "后端端口"
    kill_by_port 3001 "前端端口"
    
    # 4. 关闭 Docker 容器（如果存在）
    echo ""
    echo "--- Docker 容器检查 ---"
    stop_docker
fi

# 最终检查
echo ""
echo "=" | head -c 50
echo ""
echo "🔍 最终检查..."

# 检查后端（包括所有可能的变体）
backend_check=$(pgrep -f "bun.*dev\|elizaos.*dev\|elizaos.*start\|bun.*run.*dev\|node.*elizaos\|node.*chain_prophet" 2>/dev/null)
backend_port_check=$(lsof -ti:3000 2>/dev/null)

# 检查前端（包括所有可能的变体）
frontend_check=$(pgrep -f "vite\|npm.*dev\|npm.*run.*dev\|node.*vite\|node.*frontend" 2>/dev/null)
frontend_port_check=$(lsof -ti:3001 2>/dev/null)

# 检查所有可能的 node 进程（可能是后台进程）
all_node_processes=$(pgrep -f "node.*chain_prophet\|node.*frontend" 2>/dev/null)

# 汇总结果
echo ""
if [ -z "$backend_check" ] && [ -z "$backend_port_check" ] && [ -z "$frontend_check" ] && [ -z "$frontend_port_check" ] && [ -z "$all_node_processes" ]; then
    echo "✅ 所有服务已完全关闭！"
    echo ""
    echo "📊 关闭摘要:"
    echo "   - 后端服务: ✅ 已关闭"
    echo "   - 前端服务: ✅ 已关闭"
    echo "   - 端口 3000: ✅ 已释放"
    echo "   - 端口 3001: ✅ 已释放"
    echo "   - 相关 Node 进程: ✅ 已关闭"
    exit 0
else
    echo "⚠️  部分服务可能仍在运行:"
    local has_issues=0
    
    if [ ! -z "$backend_check" ] || [ ! -z "$backend_port_check" ]; then
        echo "   - 后端服务: ❌ 仍在运行"
        has_issues=1
        if [ ! -z "$backend_check" ]; then
            echo "     进程 PID: $backend_check"
            for pid in $backend_check; do
                ps -p $pid -o pid,cmd --no-headers 2>/dev/null | sed "s/^/        /"
            done
        fi
        if [ ! -z "$backend_port_check" ]; then
            echo "     端口占用 PID: $backend_port_check"
            for pid in $backend_port_check; do
                ps -p $pid -o pid,cmd --no-headers 2>/dev/null | sed "s/^/        /"
            done
        fi
    fi
    
    if [ ! -z "$frontend_check" ] || [ ! -z "$frontend_port_check" ]; then
        echo "   - 前端服务: ❌ 仍在运行"
        has_issues=1
        if [ ! -z "$frontend_check" ]; then
            echo "     进程 PID: $frontend_check"
            for pid in $frontend_check; do
                ps -p $pid -o pid,cmd --no-headers 2>/dev/null | sed "s/^/        /"
            done
        fi
        if [ ! -z "$frontend_port_check" ]; then
            echo "     端口占用 PID: $frontend_port_check"
            for pid in $frontend_port_check; do
                ps -p $pid -o pid,cmd --no-headers 2>/dev/null | sed "s/^/        /"
            done
        fi
    fi
    
    if [ ! -z "$all_node_processes" ]; then
        echo "   - 相关 Node 进程: ❌ 仍在运行"
        has_issues=1
        echo "     进程 PID: $all_node_processes"
        for pid in $all_node_processes; do
            ps -p $pid -o pid,cmd --no-headers 2>/dev/null | sed "s/^/        /"
        done
    fi
    
    if [ $has_issues -eq 1 ]; then
        echo ""
        echo "⚠️  检测到仍有进程在运行，尝试强力关闭..."
        echo ""
        force_kill_all
        
        # 再次检查
        echo ""
        echo "🔍 再次检查..."
        backend_check=$(pgrep -f "bun.*dev\|elizaos.*dev\|elizaos.*start\|bun.*run.*dev\|node.*elizaos\|node.*chain_prophet" 2>/dev/null)
        backend_port_check=$(lsof -ti:3000 2>/dev/null)
        frontend_check=$(pgrep -f "vite\|npm.*dev\|npm.*run.*dev\|node.*vite\|node.*frontend" 2>/dev/null)
        frontend_port_check=$(lsof -ti:3001 2>/dev/null)
        all_node_processes=$(pgrep -f "node.*chain_prophet\|node.*frontend" 2>/dev/null)
        
        if [ -z "$backend_check" ] && [ -z "$backend_port_check" ] && [ -z "$frontend_check" ] && [ -z "$frontend_port_check" ] && [ -z "$all_node_processes" ]; then
            echo "✅ 强力关闭成功！所有服务已完全关闭"
            exit 0
        else
            echo ""
            echo "❌ 仍有进程无法关闭，请手动终止:"
            if [ ! -z "$backend_check" ]; then
                for pid in $backend_check; do
                    echo "   kill -9 $pid  # 后端进程"
                done
            fi
            if [ ! -z "$frontend_check" ]; then
                for pid in $frontend_check; do
                    echo "   kill -9 $pid  # 前端进程"
                done
            fi
            if [ ! -z "$backend_port_check" ]; then
                for pid in $backend_port_check; do
                    echo "   kill -9 $pid  # 后端端口占用"
                done
            fi
            if [ ! -z "$frontend_port_check" ]; then
                for pid in $frontend_port_check; do
                    echo "   kill -9 $pid  # 前端端口占用"
                done
            fi
            if [ ! -z "$all_node_processes" ]; then
                for pid in $all_node_processes; do
                    echo "   kill -9 $pid  # Node 进程"
                done
            fi
            echo ""
            echo "或者使用以下命令分别关闭:"
            echo "   pkill -9 -f 'bun.*dev'"
            echo "   pkill -9 -f 'elizaos'"
            echo "   pkill -9 -f 'vite'"
            echo "   pkill -9 -f 'npm.*dev'"
            exit 1
        fi
    fi
fi

