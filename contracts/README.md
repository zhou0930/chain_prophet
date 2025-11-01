# NFT Marketplace Contracts

NFT 市场、质押和借贷智能合约项目。

## 快速开始

### 1. 安装 Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. 安装依赖

```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

### 3. 配置环境

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的私钥和 RPC 端点
```

### 4. 编译合约

```bash
forge build
```

### 5. 测试合约

```bash
forge test
```

### 6. 部署到 Sepolia

```bash
# 确保 .env 文件已配置
source .env

# 使用部署脚本
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url sepolia \
    --broadcast \
    --verify \
    -vvvv
```

## 合约说明

- **NFTMarketplace.sol**: NFT 上架和交易市场
- **NFTStaking.sol**: NFT 质押和奖励分发
- **NFTLoan.sol**: NFT 借贷和清算

详细文档请参考 [FOUNDRY_DEPLOYMENT_GUIDE.md](../FOUNDRY_DEPLOYMENT_GUIDE.md)

