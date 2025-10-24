# 🔗 Chain Prophet - EVM 插件集成指南

本指南将帮助您配置和使用 Chain Prophet，一个专业的区块链专家 AI 代理，集成 ElizaOS EVM 插件实现高级区块链操作功能。

## 📋 Chain Prophet 功能概述

Chain Prophet 是一个专业的区块链专家 AI 代理，具备以下核心能力：

### 🎯 专业特性
- **精确技术分析**: 提供准确的区块链协议和智能合约信息
- **安全交易执行**: 协助交易准备、Gas 估算和参数验证
- **风险预警**: 识别高 Gas 费用、合约漏洞和钓鱼攻击风险
- **网络监控**: 实时监控网络状况以优化交易成功率
- **专业术语**: 正确使用区块链术语，避免炒作和投机性声明

### 🔧 技术能力
- **代币转账**: 原生代币和 ERC20 代币转账
- **代币交换**: 使用最优路径进行代币交换
- **跨链桥接**: 在不同链之间转移代币
- **治理操作**: 参与 DAO 治理投票和提案
- **钱包管理**: 多链余额跟踪
- **Gas 优化**: 智能 Gas 费用估算和优化建议
- **安全审计**: 交易前安全检查和风险评估
- **网络分析**: 区块链网络状况监控和分析

## 🚀 快速开始

### 1. 环境配置

创建 `.env` 文件并配置以下变量：

```bash
# 必需的 EVM 配置
EVM_PRIVATE_KEY=your_private_key_here

# 可选的 RPC 端点配置（提高性能）
ETHEREUM_PROVIDER_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_PROVIDER_BASE=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_PROVIDER_ARBITRUM=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_PROVIDER_OPTIMISM=https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_PROVIDER_POLYGON=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# 可选的 TEE 安全配置
TEE_MODE=false
WALLET_SECRET_SALT=your_secret_salt_here
```

### 2. 安装依赖

```bash
bun install
```

### 3. 启动项目

```bash
# 开发模式
bun run dev

# 生产模式
bun run start
```

## 💬 使用示例

### 代币转账

```
用户: "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
代理: "I can help you transfer 0.1 ETH to that address. Let me execute that transaction for you."
```

### 代币交换

```
用户: "Swap 100 USDC for DAI on Arbitrum"
代理: "I'll help you swap 100 USDC for DAI on Arbitrum. Let me find the best route and execute the swap."
```

### 跨链桥接

```
用户: "Bridge 50 USDC from Ethereum to Base"
代理: "I'll bridge 50 USDC from Ethereum to Base using the optimal route."
```

### 治理投票

```
用户: "Vote FOR on proposal #42"
代理: "I'll vote FOR on proposal #42 for you."
```

## 🔧 支持的链

EVM 插件支持所有 EVM 兼容链，包括：

- **以太坊主网** (Ethereum)
- **Layer 2**: Base, Arbitrum, Optimism, zkSync
- **其他 L1**: Polygon, BSC, Avalanche
- **更多链**: Linea, Scroll, Mantle, Blast

## 🛡️ 安全注意事项

### 私钥安全
- ❌ **永远不要**在代码中硬编码私钥
- ✅ **使用环境变量**存储敏感信息
- ✅ **使用硬件钱包**处理大额交易
- ✅ **先在测试网测试**小额操作

### 交易安全
- ✅ **验证地址**在执行交易前
- ✅ **设置适当的滑点容忍度**
- ✅ **监控 Gas 价格和限制**
- ✅ **小额测试**新功能

## 🧪 测试

运行测试套件：

```bash
# 运行所有测试
bun run test

# 运行 EVM 插件测试
bun test src/__tests__/evm-plugin.test.ts

# 运行组件测试
bun run test:component

# 运行 E2E 测试
bun run test:e2e
```

## 📚 高级功能

### 自定义链配置

添加自定义 RPC 端点：

```bash
ETHEREUM_PROVIDER_CUSTOM_CHAIN=https://your-custom-rpc.com/v2/YOUR_KEY
```

### TEE 钱包派生

启用 TEE 模式增强安全性：

```bash
TEE_MODE=true
WALLET_SECRET_SALT=your_unique_salt
```

### 多聚合器交换

插件自动使用多个 DEX 聚合器找到最佳交换路径：
- **主要**: LiFi SDK
- **备用**: Bebop

## 🐛 故障排除

### 常见问题

1. **"Insufficient funds"**
   - 检查钱包余额是否包含 Gas 费用
   - 确保有足够的代币进行交易

2. **"Invalid address"**
   - 确保地址格式正确
   - 使用校验和格式的地址

3. **"Gas estimation failed"**
   - 尝试使用固定 Gas 限制
   - 检查网络拥堵情况

4. **"Network error"**
   - 检查 RPC 端点可用性
   - 尝试使用备用 RPC 端点

### 调试技巧

1. **启用详细日志**:
   ```bash
   LOG_LEVEL=debug
   ```

2. **使用测试网**:
   - 先在 Goerli、Sepolia 等测试网测试
   - 确认功能正常后再使用主网

3. **监控交易状态**:
   - 使用 Etherscan 等区块浏览器
   - 检查交易确认状态

## 📖 更多资源

- [ElizaOS EVM 插件文档](https://docs.elizaos.ai/plugin-registry/defi/evm)
- [EVM 插件开发者指南](https://docs.elizaos.ai/plugin-registry/defi/evm/complete-documentation)
- [操作流程指南](https://docs.elizaos.ai/plugin-registry/defi/evm/defi-operations-flow)
- [使用示例](https://docs.elizaos.ai/plugin-registry/defi/evm/examples)
- [测试指南](https://docs.elizaos.ai/plugin-registry/defi/evm/testing-guide)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进 EVM 插件集成！

---

**注意**: 使用区块链功能时请务必谨慎，建议先在测试网环境充分测试后再使用主网。
