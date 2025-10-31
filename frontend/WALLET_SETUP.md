# 钱包配置说明

## 配置位置

钱包私钥配置在 `frontend/.env` 文件中。

## 配置步骤

1. 复制环境变量示例文件：
```bash
cd frontend
cp env.example .env
```

2. 编辑 `.env` 文件，添加您的私钥：
```env
# Web3 钱包配置
VITE_WALLET_PRIVATE_KEY=your_private_key_here

# Sepolia 测试网 RPC URL（已配置，无需修改）
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/443ab1c362d646dcaa353c5b653c8173
```

3. 将 `your_private_key_here` 替换为您的实际私钥（以 `0x` 开头的 64 位十六进制字符串）

4. **重要：** `.env` 文件已经添加到 `.gitignore`，不会被提交到版本控制系统

## 安全提醒

- ⚠️ **永远不要**将私钥提交到 Git 仓库
- ⚠️ **永远不要**在公共场合分享您的私钥
- ⚠️ 建议使用测试网私钥进行开发
- ⚠️ 主网私钥应保存在安全的地方

## 功能说明

配置私钥后，您可以在"我的钱包"页面：
- 查看钱包地址
- 查看钱包余额（Sepolia 测试网）
- 查看最近的交易记录（需要集成区块浏览器 API）

## 重启开发服务器

配置私钥后，需要重启开发服务器才能生效：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

