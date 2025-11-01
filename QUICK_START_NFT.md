# 🚀 NFT 功能快速开始指南

## 📦 您的合约地址

```
TestNFT:         0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330
NFTMarketplace:  0x96D1227aCD29057607601Afdf16BF853D5B58203
NFTStaking:      0x0Ef064805ecad331F2d1ED363E6C7cD7E06831e9
NFTLoan:         0xbeB3110F3563BD63dDb05F0813213d2dAC3e0BE1
```

## ✅ 可以上架！完整使用流程

### 第一步：铸造 NFT

首先需要拥有一些 NFT，才能进行上架、质押等操作。

**方法 1：通过 Foundry 铸造**

```bash
cd contracts
export PATH="$HOME/.foundry/bin:$PATH"

# 查看当前部署者地址
cast wallet address --private-key $PRIVATE_KEY

# 铸造一个 NFT 给自己（部署者就是合约 owner）
cast send 0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330 \
  "mint(address)" YOUR_ADDRESS \
  --rpc-url sepolia \
  --private-key $PRIVATE_KEY

# 批量铸造 5 个 NFT
cast send 0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330 \
  "batchMint(address,uint256)" YOUR_ADDRESS 5 \
  --rpc-url sepolia \
  --private-key $PRIVATE_KEY
```

**方法 2：通过前端铸造（推荐）**

前端界面会显示"我的 NFT"页面，但需要先铸造 NFT。

### 第二步：上架 NFT

1. **访问前端应用**：
   ```bash
   cd frontend
   npm run dev
   ```

2. **确保环境变量已配置**（`frontend/.env`）：
   ```env
   VITE_NFT_CONTRACT_ADDRESS=0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330
   VITE_NFT_MARKETPLACE_ADDRESS=0x96D1227aCD29057607601Afdf16BF853D5B58203
   VITE_NFT_STAKING_ADDRESS=0x0Ef064805ecad331F2d1ED363E6C7cD7E06831e9
   VITE_NFT_LOAN_ADDRESS=0xbeB3110F3563BD63dDb05F0813213d2dAC3e0BE1
   ```

3. **上架步骤**：
   - 访问"我的 NFT"页面
   - 点击"授权市场合约"按钮（每个 NFT 首次需要）
   - 点击"上架"按钮
   - 输入价格（例如：`0.1` 表示 0.1 ETH）
   - 确认交易

---

## 🎯 每个合约的用途

### 1. TestNFT - NFT 创建合约
**作用**: 创建和铸造 NFT 代币
- 只有合约 owner（部署者）可以铸造
- 可以单个或批量铸造
- 符合 ERC721 标准

### 2. NFTMarketplace - 交易市场
**作用**: NFT 上架、买卖
- ✅ **可以上架** - 将 NFT 上架到市场
- ✅ **可以购买** - 购买其他用户上架的 NFT
- ✅ **可以取消** - 取消已上架的 NFT
- 收取 2.5% 交易手续费

### 3. NFTStaking - 质押合约
**作用**: 质押 NFT 获得奖励
- 质押 NFT 至少 7 天
- 每天约 1% 奖励率
- 可以随时领取奖励

### 4. NFTLoan - 借贷合约
**作用**: 使用 NFT 作为抵押品借贷
- 创建借贷请求
- 其他用户可以提供资金
- 按时还款赎回 NFT

---

## 🔧 快速测试

### 测试上架流程

1. **铸造测试 NFT**：
   ```bash
   # 确认您的地址（合约 owner）
   cast wallet address --private-key $PRIVATE_KEY
   
   # 铸造 NFT
   cast send 0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330 \
     "mint(address)" 0x338eA4a3CbF46E5Cc332033FD5A02A3BB0478145 \
     --rpc-url sepolia \
     --private-key $PRIVATE_KEY
   ```

2. **在前端查看**：
   - 访问 http://localhost:5173/my-nft
   - 应该能看到刚才铸造的 NFT

3. **上架 NFT**：
   - 点击"授权市场合约"
   - 点击"上架"，输入价格 `0.01`
   - 确认交易

---

## 💡 重要提示

1. **TestNFT 只有 owner 可以铸造**：部署者地址 `0x338eA4a3CbF46E5Cc332033FD5A02A3BB0478145` 是合约 owner
2. **首次上架需要授权**：每个 NFT 第一次上架前需要授权市场合约
3. **价格以 ETH 为单位**：例如 `0.1` = 0.1 ETH
4. **测试网 ETH**：确保有足够的 Sepolia ETH 支付 gas 费用

---

## 📝 下一步

- ✅ 合约已部署
- ✅ 前端已配置
- ⏭️ **现在可以**：
  1. 铸造 NFT
  2. 上架到市场
  3. 质押 NFT
  4. 创建借贷

**所有功能都可以使用！**

