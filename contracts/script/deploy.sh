#!/bin/bash

# NFT 合约部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署 NFT 市场合约..."

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ 错误: 未找到 .env 文件"
    echo "请复制 .env.example 到 .env 并配置相关参数"
    exit 1
fi

# 加载环境变量
source .env

# 检查必要的环境变量
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ 错误: PRIVATE_KEY 未设置"
    exit 1
fi

if [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "❌ 错误: SEPOLIA_RPC_URL 未设置"
    exit 1
fi

echo "📝 配置信息:"
echo "  NFT 合约地址: $NFT_CONTRACT_ADDRESS"
echo "  奖励代币地址: $REWARD_TOKEN_ADDRESS"
echo "  RPC 端点: $SEPOLIA_RPC_URL"
echo ""

# 编译合约
echo "🔨 编译合约..."
forge build

# 部署合约
echo "📦 部署合约到 Sepolia 测试网..."
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url sepolia \
    --broadcast \
    ${ETHERSCAN_API_KEY:+--verify} \
    -vvvv

echo ""
echo "✅ 部署完成！"
echo ""
echo "请将合约地址复制到 frontend/.env 文件中"

