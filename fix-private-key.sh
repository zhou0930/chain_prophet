#!/bin/bash

echo "🔧 Chain Prophet 私钥修复工具"
echo "================================"

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo "❌ 错误：未找到.env文件"
    echo "💡 请先创建.env文件：cp env-template .env"
    exit 1
fi

# 提取当前私钥配置
current_key=$(grep "EVM_PRIVATE_KEY=" .env | cut -d'=' -f2)

if [ -z "$current_key" ]; then
    echo "❌ 错误：.env文件中未找到EVM_PRIVATE_KEY配置"
    echo "💡 请在.env文件中添加: EVM_PRIVATE_KEY=your_private_key_here"
    exit 1
fi

echo "📋 当前私钥检查："
echo "   原始值: $current_key"
echo "   长度: ${#current_key}个字符"

# 清理私钥（移除0x前缀和空格）
clean_key=$(echo "$current_key" | sed 's/^0x//' | tr -d ' \t\n\r')

echo "   清理后: $clean_key"
echo "   清理后长度: ${#clean_key}个字符"

# 检查私钥格式
errors=0

# 检查长度
if [ ${#clean_key} -ne 64 ]; then
    echo "❌ 长度错误：应为64个字符，当前为${#clean_key}个字符"
    errors=$((errors + 1))
fi

# 检查是否为十六进制
if ! [[ "$clean_key" =~ ^[0-9a-fA-F]+$ ]]; then
    echo "❌ 格式错误：包含非十六进制字符"
    echo "   有效字符：0-9, a-f, A-F"
    
    # 找出无效字符
    invalid_chars=$(echo "$clean_key" | sed 's/[0-9a-fA-F]//g' | fold -w1 | sort | uniq | tr -d '\n')
    if [ ! -z "$invalid_chars" ]; then
        echo "   无效字符: $invalid_chars"
    fi
    errors=$((errors + 1))
fi

# 检查是否全为0
if [ "$clean_key" = "0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo "❌ 私钥不能全为0"
    errors=$((errors + 1))
fi

if [ $errors -eq 0 ]; then
    echo "✅ 私钥格式正确！"
    echo ""
    echo "🔧 更新.env文件中的私钥格式..."
    
    # 更新.env文件，确保私钥没有0x前缀
    sed -i "s/EVM_PRIVATE_KEY=.*/EVM_PRIVATE_KEY=$clean_key/" .env
    
    echo "✅ .env文件已更新"
    echo ""
    echo "🚀 请重新启动应用程序："
    echo "   bun run start"
    
else
    echo ""
    echo "❌ 发现 $errors 个问题，需要修复"
    echo ""
    echo "🔧 修复方法："
    echo "1. 从MetaMask导出正确的私钥："
    echo "   - 打开MetaMask"
    echo "   - 点击账户名称旁的三个点"
    echo "   - 选择'账户详情'"
    echo "   - 点击'导出私钥'"
    echo "   - 输入密码确认"
    echo "   - 复制64位十六进制私钥"
    echo ""
    echo "2. 手动输入正确的私钥："
    read -p "请输入正确的私钥 (64个字符): " new_key
    
    # 清理新私钥
    new_clean_key=$(echo "$new_key" | sed 's/^0x//' | tr -d ' \t\n\r')
    
    # 验证新私钥
    if [ ${#new_clean_key} -eq 64 ] && [[ "$new_clean_key" =~ ^[0-9a-fA-F]+$ ]]; then
        echo "✅ 新私钥格式正确"
        
        # 更新.env文件
        sed -i "s/EVM_PRIVATE_KEY=.*/EVM_PRIVATE_KEY=$new_clean_key/" .env
        
        echo "✅ .env文件已更新"
        echo "🚀 请重新启动应用程序："
        echo "   bun run start"
    else
        echo "❌ 新私钥格式仍然不正确"
        echo "   长度: ${#new_clean_key}个字符 (应为64个字符)"
    fi
fi

echo ""
echo "📚 更多帮助："
echo "   - 查看完整设置指南: cat SEPOLIA_SETUP_GUIDE.md"
echo "   - 验证私钥: node validate-private-key.js"
