# NFT 市场功能配置指南

本指南将帮助您配置和使用 NFT 市场功能，包括上架、交易、质押和借贷等功能。

## 📋 功能概述

NFT 市场提供以下核心功能：

### 🛍️ 市场交易
- **上架 NFT**: 将您拥有的 NFT 上架到市场进行出售
- **购买 NFT**: 浏览市场并购买上架的 NFT
- **取消上架**: 随时取消您已上架的 NFT

### 🔒 质押功能
- **质押 NFT**: 将 NFT 质押以获取收益
- **解除质押**: 解除已质押的 NFT
- **领取奖励**: 领取质押产生的奖励

### 💰 借贷功能
- **创建借贷**: 使用 NFT 作为抵押品创建借贷请求
- **出借资金**: 为 NFT 借贷市场提供流动性
- **还款**: 归还借贷并赎回抵押的 NFT

## 🚀 快速开始

### 1. 环境配置

创建 `.env` 文件并配置以下变量：

```bash
cd frontend
cp env.example .env
```

编辑 `.env` 文件：

```env
# Web3 钱包配置（必需）
VITE_WALLET_PRIVATE_KEY=your_private_key_here

# Sepolia 测试网 RPC URL（必需）
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/443ab1c362d646dcaa353c5b653c8173

# NFT 智能合约地址（部署合约后配置）
VITE_NFT_MARKETPLACE_ADDRESS=0xYourMarketplaceContractAddress
VITE_NFT_STAKING_ADDRESS=0xYourStakingContractAddress
VITE_NFT_LOAN_ADDRESS=0xYourLoanContractAddress

# Etherscan API Key（可选，用于查看交易）
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. 部署智能合约

NFT 市场功能需要部署以下智能合约：

#### 📄 合约文件

合约文件示例位于项目的智能合约目录中（需要根据实际需求部署）：

- **NFT Marketplace 合约**: 用于 NFT 上架和交易
- **NFT Staking 合约**: 用于 NFT 质押和奖励分发
- **NFT Loan 合约**: 用于 NFT 借贷和清算

#### 🔧 部署步骤

1. 准备部署环境
   ```bash
   # 安装 Hardhat
   npm install --save-dev hardhat
   ```

2. 配置网络
   ```bash
   # 在 hardhat.config.js 中配置 Sepolia 测试网
   ```

3. 部署合约
   ```bash
   # 部署所有合约
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. 获取合约地址
   部署完成后，将合约地址填入 `.env` 文件。

### 3. 启动应用

配置完成后，启动开发服务器：

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

## 💻 使用说明

### 上架 NFT

1. 进入 **NFT 市场** 页面
2. 点击 **市场交易** 标签
3. 在 **上架 NFT** 区域输入：
   - **Token ID**: NFT 的 Token ID
   - **价格**: 上架价格（ETH）
4. 点击 **上架** 按钮
5. 确认交易并等待上链确认

### 购买 NFT

1. 进入 **NFT 市场** 页面
2. 点击 **市场交易** 标签
3. 在 **购买 NFT** 区域输入：
   - **Token ID**: 要购买的 NFT 的 Token ID
   - **价格**: 购买价格（ETH）
4. 点击 **购买** 按钮
5. 确认交易并等待上链确认

### 质押 NFT

1. 进入 **NFT 市场** 页面
2. 点击 **质押** 标签
3. 在 **质押 NFT** 区域输入：
   - **Token ID**: 要质押的 NFT 的 Token ID
4. 点击 **质押** 按钮
5. 确认交易并等待上链确认

### 创建借贷

1. 进入 **NFT 市场** 页面
2. 点击 **借贷** 标签
3. 在 **创建借贷** 区域输入：
   - **Token ID**: 作为抵押品的 NFT 的 Token ID
   - **借贷金额**: 借贷金额（ETH）
   - **借贷期限**: 借贷期限（天）
4. 点击 **创建借贷** 按钮
5. 确认交易并等待上链确认

## 🔒 安全提示

### 私钥安全

- ⚠️ **永远不要**将私钥提交到 Git 仓库
- ⚠️ **永远不要**在公共场合分享您的私钥
- ⚠️ 建议使用测试网私钥进行开发
- ⚠️ 主网私钥应保存在安全的地方

### 交易安全

- ✅ 在测试网上充分测试所有功能
- ✅ 确认合约地址正确无误
- ✅ 检查 Gas 价格和交易费用
- ✅ 小额测试新功能

### 合约安全

- ✅ 使用经过审计的智能合约
- ✅ 仔细审查合约代码
- ✅ 了解合约的风险和限制
- ✅ 设置适当的权限管理

## 🧪 测试

在 Sepolia 测试网上测试 NFT 市场功能：

1. 获取 Sepolia 测试 ETH
   ```bash
   # 使用 Sepolia 水龙头
   https://sepoliafaucet.com/
   ```

2. 创建测试 NFT
   - 在测试网上部署或使用已有的测试 NFT 合约

3. 测试所有功能
   - 上架 NFT
   - 购买 NFT
   - 质押 NFT
   - 创建借贷

## 📊 功能限制

当前版本的 NFT 市场功能有以下限制：

1. **需要部署智能合约**: 必须部署相应的智能合约才能使用
2. **仅支持 Sepolia 测试网**: 当前仅支持 Sepolia 测试网
3. **需要测试 NFT**: 需要拥有测试 NFT 才能使用相关功能
4. **Gas 费用**: 所有操作都需要支付 Gas 费用

## 🛠️ 故障排除

### 常见问题

1. **合约地址未配置**
   - 错误信息: "请配置智能合约地址"
   - 解决方案: 在 `.env` 文件中配置正确的合约地址

2. **私钥格式错误**
   - 错误信息: "私钥格式错误"
   - 解决方案: 确保私钥以 `0x` 开头且长度为 66 字符

3. **交易失败**
   - 错误信息: "交易失败"
   - 解决方案: 检查余额是否充足、Gas 价格是否合理、合约地址是否正确

4. **RPC 连接失败**
   - 错误信息: "RPC 连接失败"
   - 解决方案: 检查 RPC URL 是否正确或使用其他 RPC 端点

## 📚 参考资料

- [Viem 文档](https://viem.sh/)
- [Hardhat 文档](https://hardhat.org/docs)
- [EIP-721 标准](https://eips.ethereum.org/EIPS/eip-721)
- [Sepolia 测试网](https://sepolia.dev/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进 NFT 市场功能！

## 📝 许可证

MIT License

