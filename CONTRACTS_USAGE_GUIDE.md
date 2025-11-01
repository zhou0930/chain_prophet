# 📚 合约使用完整指南

您已经部署了完整的 NFT 生态系统！以下是每个合约的详细说明和使用方法。

## 🎯 合约概览

### 1. **TestNFT** (`0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330`)
**功能**: ERC721 NFT 合约，用于创建和铸造 NFT

**用途**:
- ✅ 铸造新的 NFT 代币
- ✅ 查看 NFT 的总供应量
- ✅ 查询 NFT 的所有者
- ✅ 获取 NFT 的元数据（tokenURI）

**主要函数**:
- `mint(address to)` - 铸造一个 NFT 给指定地址
- `batchMint(address to, uint256 amount)` - 批量铸造 NFT
- `tokenURI(uint256 tokenId)` - 获取 NFT 的元数据 URI

---

### 2. **NFTMarketplace** (`0x96D1227aCD29057607601Afdf16BF853D5B58203`)
**功能**: NFT 交易市场，用于上架和买卖 NFT

**用途**:
- ✅ **上架 NFT** - 将您的 NFT 上架到市场出售
- ✅ **购买 NFT** - 购买其他用户上架的 NFT
- ✅ **取消上架** - 取消已上架的 NFT
- ✅ **查询上架信息** - 查看 NFT 的上架状态和价格

**主要函数**:
- `listNFT(uint256 tokenId, uint256 price)` - 上架 NFT 到市场
- `buyNFT(uint256 tokenId)` - 购买上架的 NFT
- `cancelListing(uint256 tokenId)` - 取消上架
- `getListing(uint256 tokenId)` - 查询上架信息

**手续费**: 2.5% 的交易手续费

---

### 3. **NFTStaking** (`0x0Ef064805ecad331F2d1ED363E6C7cD7E06831e9`)
**功能**: NFT 质押合约，质押 NFT 获得收益

**用途**:
- ✅ **质押 NFT** - 将 NFT 质押到合约中
- ✅ **解除质押** - 解除质押并领取奖励
- ✅ **领取奖励** - 定期领取质押产生的奖励
- ✅ **查询质押信息** - 查看质押详情和奖励

**主要函数**:
- `stakeNFT(uint256 tokenId)` - 质押 NFT
- `unstakeNFT(uint256 tokenId)` - 解除质押
- `claimRewards(uint256 tokenId)` - 领取奖励
- `getStakingInfo(uint256 tokenId)` - 查询质押信息

**质押规则**:
- 最小质押期限：7 天
- 奖励率：每天约 1%（可配置）

---

### 4. **NFTLoan** (`0xbeB3110F3563BD63dDb05F0813213d2dAC3e0BE1`)
**功能**: NFT 借贷合约，使用 NFT 作为抵押品进行借贷

**用途**:
- ✅ **创建借贷** - 使用 NFT 作为抵押品创建借贷请求
- ✅ **出借资金** - 为 NFT 借贷提供流动性
- ✅ **还款** - 归还借贷并赎回抵押的 NFT
- ✅ **清算** - 到期未还款时，贷款人可以清算抵押品

**主要函数**:
- `createLoan(uint256 tokenId, uint256 loanAmount, uint256 duration)` - 创建借贷
- `fulfillLoan(uint256 loanId)` - 出借资金
- `repayLoan(uint256 loanId)` - 还款
- `claimCollateral(uint256 loanId)` - 清算抵押品
- `getLoanInfo(uint256 loanId)` - 查询借贷信息

**借贷规则**:
- 最小期限：7 天
- 最大期限：365 天
- 默认利率：10% 年化（可配置）

---

## 🚀 完整使用流程

### 第一步：铸造 NFT

1. **通过前端界面铸造**（如果已实现）
2. **或者通过合约直接铸造**：
   ```bash
   # 使用 cast 命令（Foundry）
   cast send 0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330 \
     "mint(address)" YOUR_ADDRESS \
     --rpc-url sepolia \
     --private-key YOUR_PRIVATE_KEY
   ```

### 第二步：上架 NFT 到市场

1. **访问"我的 NFT"页面**
2. **点击"授权市场合约"按钮**（首次需要）
3. **点击"上架"按钮**
4. **输入价格（ETH）**
5. **确认交易**

### 第三步：购买 NFT

1. **访问"NFT 市场"页面**
2. **在"购买 NFT"区域输入 Token ID 和价格**
3. **点击"购买"按钮**
4. **确认交易**

### 第四步：质押 NFT（可选）

1. **访问"NFT 市场"页面**
2. **切换到"质押"标签**
3. **输入要质押的 Token ID**
4. **点击"质押"按钮**

### 第五步：创建 NFT 借贷（可选）

1. **访问"NFT 市场"页面**
2. **切换到"借贷"标签**
3. **输入 Token ID、借贷金额和期限**
4. **点击"创建借贷"按钮**

---

## ✅ 可以上架吗？

**完全可以！** 您的合约已经完全部署好，可以使用以下方式上架：

### 方式 1：通过前端界面（推荐）

1. **确保已配置前端环境变量**：
   ```env
   VITE_NFT_CONTRACT_ADDRESS=0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330
   VITE_NFT_MARKETPLACE_ADDRESS=0x96D1227aCD29057607601Afdf16BF853D5B58203
   VITE_NFT_STAKING_ADDRESS=0x0Ef064805ecad331F2d1ED363E6C7cD7E06831e9
   VITE_NFT_LOAN_ADDRESS=0xbeB3110F3563BD63dDb05F0813213d2dAC3e0BE1
   ```

2. **启动前端应用**：
   ```bash
   cd frontend
   npm run dev
   ```

3. **使用步骤**：
   - 访问"我的 NFT"页面
   - 授权市场合约（首次）
   - 点击"上架"，输入价格
   - 确认交易

### 方式 2：直接调用合约

```bash
# 1. 先授权市场合约
cast send 0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330 \
  "approve(address,uint256)" \
  0x96D1227aCD29057607601Afdf16BF853D5B58203 \
  TOKEN_ID \
  --rpc-url sepolia \
  --private-key YOUR_PRIVATE_KEY

# 2. 上架 NFT（价格以 wei 为单位，例如 0.1 ETH = 100000000000000000）
cast send 0x96D1227aCD29057607601Afdf16BF853D5B58203 \
  "listNFT(uint256,uint256)" \
  TOKEN_ID \
  100000000000000000 \
  --rpc-url sepolia \
  --private-key YOUR_PRIVATE_KEY \
  --value 0
```

---

## 🔍 查看合约状态

### 在 Etherscan 查看合约

- **TestNFT**: https://sepolia.etherscan.io/address/0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330
- **NFTMarketplace**: https://sepolia.etherscan.io/address/0x96D1227aCD29057607601Afdf16BF853D5B58203
- **NFTStaking**: https://sepolia.etherscan.io/address/0x0Ef064805ecad331F2d1ED363E6C7cD7E06831e9
- **NFTLoan**: https://sepolia.etherscan.io/address/0xbeB3110F3563BD63dDb05F0813213d2dAC3e0BE1

### 查询 NFT 信息

```bash
# 查询 NFT 所有者
cast call 0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330 \
  "ownerOf(uint256)" TOKEN_ID \
  --rpc-url sepolia

# 查询总供应量
cast call 0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330 \
  "totalSupply()" \
  --rpc-url sepolia

# 查询上架信息
cast call 0x96D1227aCD29057607601Afdf16BF853D5B58203 \
  "getListing(uint256)" TOKEN_ID \
  --rpc-url sepolia
```

---

## 📋 完整功能清单

### ✅ 已实现的功能

- [x] NFT 铸造（TestNFT）
- [x] NFT 上架到市场（NFTMarketplace）
- [x] NFT 购买（NFTMarketplace）
- [x] NFT 质押（NFTStaking）
- [x] NFT 借贷（NFTLoan）
- [x] 前端界面（我的 NFT、市场、质押、借贷）
- [x] 授权管理（自动授权提示）

### 🔄 使用流程总结

```
铸造 NFT → 授权市场合约 → 上架到市场 → 其他用户购买
    ↓
质押 NFT → 获得奖励 → 解除质押
    ↓
使用 NFT 作为抵押品 → 创建借贷 → 还款或清算
```

---

## 💡 提示

1. **首次上架前必须授权**：点击"授权市场合约"按钮
2. **价格以 ETH 为单位**：例如 `0.1` 表示 0.1 ETH
3. **质押最少 7 天**：少于 7 天无法解除质押
4. **借贷需按时还款**：逾期可能被清算

---

## 🎊 总结

您的合约已经**完全可以使用**！现在您可以：

1. ✅ **铸造 NFT**
2. ✅ **上架 NFT 到市场**
3. ✅ **购买/出售 NFT**
4. ✅ **质押 NFT 获得收益**
5. ✅ **使用 NFT 进行借贷**

所有功能都已经在前端界面中实现，直接使用即可！

