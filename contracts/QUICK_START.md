# Foundry 快速开始指南

## 🚀 5 分钟快速部署

### 1. 安装 Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. 安装依赖

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

### 3. 配置环境

创建 `contracts/.env` 文件：

```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
NFT_CONTRACT_ADDRESS=0xYourNFTContractAddress
REWARD_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
```

### 4. 部署

```bash
# 方法 1: 使用脚本
./script/deploy.sh

# 方法 2: 手动部署
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url sepolia \
    --broadcast \
    --verify \
    -vvvv
```

### 5. 更新前端配置

部署完成后，将合约地址复制到 `frontend/.env`：

```env
VITE_NFT_MARKETPLACE_ADDRESS=0x...
VITE_NFT_STAKING_ADDRESS=0x...
VITE_NFT_LOAN_ADDRESS=0x...
```

## 📝 注意事项

1. **需要先部署 NFT 合约**: 如果你还没有 NFT 合约，需要先部署一个 ERC721 合约
2. **获取测试 ETH**: 访问 https://sepoliafaucet.com/ 获取 Sepolia 测试 ETH
3. **私钥安全**: 永远不要将私钥提交到 Git 仓库

## 🔗 完整文档

详细文档请参考:
- [FOUNDRY_DEPLOYMENT_GUIDE.md](../FOUNDRY_DEPLOYMENT_GUIDE.md) - 完整部署指南
- [frontend/NFT_MARKETPLACE_SETUP.md](../frontend/NFT_MARKETPLACE_SETUP.md) - 前端配置指南

