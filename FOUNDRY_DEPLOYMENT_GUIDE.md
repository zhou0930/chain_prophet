# Foundry 合约部署指南

本指南将帮助您使用 Foundry 部署 NFT 市场、质押和借贷智能合约。

## 📋 目录

- [安装 Foundry](#安装-foundry)
- [项目初始化](#项目初始化)
- [合约代码](#合约代码)
- [部署脚本](#部署脚本)
- [测试合约](#测试合约)
- [部署到 Sepolia](#部署到-sepolia)
- [验证合约](#验证合约)
- [配置前端](#配置前端)

## 🚀 安装 Foundry

### Linux / macOS

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Windows

使用 WSL (Windows Subsystem for Linux) 或在 PowerShell 中：

```powershell
# 安装 Rust
winget install Rustlang.Rust.MSVC

# 安装 Foundry
cargo install foundry-cli anvil cast forge
```

### 验证安装

```bash
forge --version
cast --version
anvil --version
```

## 📁 项目初始化

### 1. 创建 Foundry 项目

```bash
# 在项目根目录创建 contracts 目录
mkdir -p contracts
cd contracts

# 初始化 Foundry 项目
forge init --force

# 项目结构
contracts/
├── src/          # 合约源代码
├── test/         # 测试文件
├── script/       # 部署脚本
├── foundry.toml  # Foundry 配置
└── lib/          # 依赖库
```

### 2. 安装依赖

```bash
# 安装 OpenZeppelin 合约库
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# 安装 Solmate（可选，更轻量）
forge install transmissions11/solmate --no-commit
```

### 3. 配置 foundry.toml

编辑 `contracts/foundry.toml`：

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.23"
optimizer = true
optimizer_runs = 200
via_ir = false

[rpc_endpoints]
sepolia = "${SEPOLIA_RPC_URL}"
mainnet = "${MAINNET_RPC_URL}"

[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}" }
```

## 📄 合约代码

### 1. NFT Marketplace 合约

创建 `contracts/src/NFTMarketplace.sol`：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
        uint256 timestamp;
    }

    IERC721 public nftContract;
    mapping(uint256 => Listing) public listings;
    uint256 public listingFee = 0.025 ether; // 2.5% 手续费
    uint256 public platformFee = 0.01 ether; // 1% 平台费

    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId);

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
    }

    function listNFT(uint256 tokenId, uint256 price) external nonReentrant {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].active, "Already listed");

        // 转移 NFT 到市场合约
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true,
            timestamp: block.timestamp
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not for sale");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;

        // 标记为已售出
        listing.active = false;

        // 转移 NFT 给买家
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        // 计算费用
        uint256 fee = (price * listingFee) / 1000;
        uint256 sellerPayment = price - fee;

        // 支付卖方
        (bool success, ) = payable(seller).call{value: sellerPayment}("");
        require(success, "Payment failed");

        // 退还多余金额
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }

        emit NFTSold(tokenId, seller, msg.sender, price);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not your listing");
        require(listing.active, "Not active");

        listing.active = false;

        // 归还 NFT
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        emit ListingCancelled(tokenId);
    }

    function getListing(uint256 tokenId) external view returns (address seller, uint256 price, bool active) {
        Listing memory listing = listings[tokenId];
        return (listing.seller, listing.price, listing.active);
    }

    function updateListingFee(uint256 _fee) external onlyOwner {
        require(_fee <= 100, "Fee too high"); // 最大 10%
        listingFee = _fee;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
```

### 2. NFT Staking 合约

创建 `contracts/src/NFTStaking.sol`：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTStaking is ReentrancyGuard, Ownable {
    struct StakingInfo {
        address staker;
        uint256 startTime;
        uint256 rewards;
        bool active;
    }

    IERC721 public nftContract;
    IERC20 public rewardToken; // 奖励代币（可选，使用 ETH 则为 address(0)）
    mapping(uint256 => StakingInfo) public stakings;
    
    uint256 public rewardRate = 1 ether / 100; // 每天 1% 的奖励（示例）
    uint256 public minStakeDuration = 7 days;

    event NFTStaked(uint256 indexed tokenId, address indexed staker, uint256 timestamp);
    event NFTUnstaked(uint256 indexed tokenId, address indexed staker, uint256 rewards);
    event RewardsClaimed(uint256 indexed tokenId, address indexed staker, uint256 amount);

    constructor(address _nftContract, address _rewardToken) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
        rewardToken = IERC20(_rewardToken);
    }

    function stakeNFT(uint256 tokenId) external nonReentrant {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!stakings[tokenId].active, "Already staked");

        // 转移 NFT 到质押合约
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        stakings[tokenId] = StakingInfo({
            staker: msg.sender,
            startTime: block.timestamp,
            rewards: 0,
            active: true
        });

        emit NFTStaked(tokenId, msg.sender, block.timestamp);
    }

    function unstakeNFT(uint256 tokenId) external nonReentrant {
        StakingInfo storage staking = stakings[tokenId];
        require(staking.staker == msg.sender, "Not your staking");
        require(staking.active, "Not staked");
        require(block.timestamp >= staking.startTime + minStakeDuration, "Too early");

        // 计算奖励
        uint256 stakingDuration = block.timestamp - staking.startTime;
        uint256 daysStaked = stakingDuration / 1 days;
        uint256 totalRewards = staking.rewards + (daysStaked * rewardRate);

        // 标记为非活跃
        staking.active = false;

        // 归还 NFT
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        // 分发奖励
        if (totalRewards > 0) {
            if (address(rewardToken) == address(0)) {
                // 使用 ETH
                (bool success, ) = payable(msg.sender).call{value: totalRewards}("");
                require(success, "Reward payment failed");
            } else {
                // 使用 ERC20 代币
                require(rewardToken.transfer(msg.sender, totalRewards), "Reward transfer failed");
            }
        }

        emit NFTUnstaked(tokenId, msg.sender, totalRewards);
    }

    function claimRewards(uint256 tokenId) external nonReentrant {
        StakingInfo storage staking = stakings[tokenId];
        require(staking.staker == msg.sender, "Not your staking");
        require(staking.active, "Not staked");

        // 计算新奖励
        uint256 stakingDuration = block.timestamp - staking.startTime;
        uint256 daysStaked = stakingDuration / 1 days;
        uint256 newRewards = daysStaked * rewardRate;
        uint256 totalRewards = staking.rewards + newRewards;

        require(totalRewards > 0, "No rewards");

        // 重置奖励和开始时间
        staking.rewards = 0;
        staking.startTime = block.timestamp;

        // 分发奖励
        if (address(rewardToken) == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: totalRewards}("");
            require(success, "Reward payment failed");
        } else {
            require(rewardToken.transfer(msg.sender, totalRewards), "Reward transfer failed");
        }

        emit RewardsClaimed(tokenId, msg.sender, totalRewards);
    }

    function getStakingInfo(uint256 tokenId) external view returns (
        address staker,
        uint256 startTime,
        uint256 rewards
    ) {
        StakingInfo memory staking = stakings[tokenId];
        if (!staking.active) {
            return (address(0), 0, 0);
        }

        uint256 stakingDuration = block.timestamp - staking.startTime;
        uint256 daysStaked = stakingDuration / 1 days;
        uint256 totalRewards = staking.rewards + (daysStaked * rewardRate);

        return (staking.staker, staking.startTime, totalRewards);
    }

    // 接收 ETH 作为奖励池
    receive() external payable {}

    function updateRewardRate(uint256 _rate) external onlyOwner {
        rewardRate = _rate;
    }

    function updateMinStakeDuration(uint256 _duration) external onlyOwner {
        minStakeDuration = _duration;
    }
}
```

### 3. NFT Loan 合约

创建 `contracts/src/NFTLoan.sol`：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTLoan is ReentrancyGuard, Ownable {
    struct Loan {
        address borrower;
        address lender;
        uint256 tokenId;
        uint256 loanAmount;
        uint256 interestRate; // 年化利率（基点，100 = 1%）
        uint256 startTime;
        uint256 dueDate;
        uint256 repaymentAmount;
        bool active;
        bool repaid;
    }

    IERC721 public nftContract;
    mapping(uint256 => Loan) public loans;
    uint256 public loanIdCounter;
    uint256 public defaultInterestRate = 1000; // 10% 年化
    uint256 public minLoanDuration = 7 days;
    uint256 public maxLoanDuration = 365 days;

    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 indexed tokenId,
        uint256 loanAmount,
        uint256 duration
    );
    event LoanFulfilled(uint256 indexed loanId, address indexed lender);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId);

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
    }

    function createLoan(
        uint256 tokenId,
        uint256 loanAmount,
        uint256 duration
    ) external nonReentrant {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(duration >= minLoanDuration && duration <= maxLoanDuration, "Invalid duration");
        require(loanAmount > 0, "Amount must be greater than 0");

        // 检查是否已有活跃的借贷
        require(!loans[loanIdCounter].active, "Previous loan still active");

        uint256 loanId = loanIdCounter++;
        uint256 interest = (loanAmount * defaultInterestRate * duration) / (365 days * 10000);
        uint256 repaymentAmount = loanAmount + interest;

        // 转移 NFT 到借贷合约作为抵押
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        loans[loanId] = Loan({
            borrower: msg.sender,
            lender: address(0),
            tokenId: tokenId,
            loanAmount: loanAmount,
            interestRate: defaultInterestRate,
            startTime: 0,
            dueDate: block.timestamp + duration,
            repaymentAmount: repaymentAmount,
            active: true,
            repaid: false
        });

        emit LoanCreated(loanId, msg.sender, tokenId, loanAmount, duration);
    }

    function fulfillLoan(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.lender == address(0), "Loan already fulfilled");
        require(msg.value >= loan.loanAmount, "Insufficient amount");

        loan.lender = msg.sender;
        loan.startTime = block.timestamp;
        loan.dueDate = block.timestamp + (loan.dueDate - block.timestamp);

        // 支付给借款人
        (bool success, ) = payable(loan.borrower).call{value: loan.loanAmount}("");
        require(success, "Payment failed");

        // 退还多余金额
        if (msg.value > loan.loanAmount) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - loan.loanAmount}("");
            require(refundSuccess, "Refund failed");
        }

        emit LoanFulfilled(loanId, msg.sender);
    }

    function repayLoan(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.lender != address(0), "Loan not fulfilled");
        require(!loan.repaid, "Already repaid");
        require(msg.value >= loan.repaymentAmount, "Insufficient repayment");

        loan.repaid = true;
        loan.active = false;

        // 归还 NFT 给借款人
        nftContract.transferFrom(address(this), loan.borrower, loan.tokenId);

        // 支付给贷款人
        (bool success, ) = payable(loan.lender).call{value: loan.repaymentAmount}("");
        require(success, "Payment failed");

        // 退还多余金额
        if (msg.value > loan.repaymentAmount) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - loan.repaymentAmount}("");
            require(refundSuccess, "Refund failed");
        }

        emit LoanRepaid(loanId, msg.sender, loan.repaymentAmount);
    }

    function claimCollateral(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.lender == msg.sender, "Not the lender");
        require(block.timestamp > loan.dueDate, "Loan not due");
        require(!loan.repaid, "Loan repaid");

        loan.active = false;

        // 将 NFT 转移给贷款人（清算）
        nftContract.transferFrom(address(this), loan.lender, loan.tokenId);

        emit LoanDefaulted(loanId);
    }

    function getLoanInfo(uint256 loanId) external view returns (
        address borrower,
        address lender,
        uint256 amount,
        uint256 dueDate,
        bool repaid
    ) {
        Loan memory loan = loans[loanId];
        return (
            loan.borrower,
            loan.lender,
            loan.loanAmount,
            loan.dueDate,
            loan.repaid
        );
    }

    receive() external payable {}

    function updateInterestRate(uint256 _rate) external onlyOwner {
        require(_rate <= 5000, "Rate too high"); // 最大 50%
        defaultInterestRate = _rate;
    }

    function updateLoanDuration(uint256 _min, uint256 _max) external onlyOwner {
        minLoanDuration = _min;
        maxLoanDuration = _max;
    }
}
```

## 📝 部署脚本

创建 `contracts/script/Deploy.s.sol`：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";
import {NFTStaking} from "../src/NFTStaking.sol";
import {NFTLoan} from "../src/NFTLoan.sol";

contract DeployScript is Script {
    // NFT 合约地址（需要先部署一个 ERC721 NFT 合约）
    address constant NFT_CONTRACT = 0x1234567890123456789012345678901234567890; // 替换为实际地址
    address constant REWARD_TOKEN = address(0); // 使用 ETH，或填入 ERC20 代币地址

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying contracts...");

        // 部署 NFT Marketplace
        NFTMarketplace marketplace = new NFTMarketplace(NFT_CONTRACT);
        console.log("NFTMarketplace deployed at:", address(marketplace));

        // 部署 NFT Staking
        NFTStaking staking = new NFTStaking(NFT_CONTRACT, REWARD_TOKEN);
        console.log("NFTStaking deployed at:", address(staking));

        // 部署 NFT Loan
        NFTLoan loan = new NFTLoan(NFT_CONTRACT);
        console.log("NFTLoan deployed at:", address(loan));

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("Marketplace:", address(marketplace));
        console.log("Staking:", address(staking));
        console.log("Loan:", address(loan));
    }
}
```

创建部署脚本 `contracts/script/deploy.sh`：

```bash
#!/bin/bash

# 设置环境变量
export PRIVATE_KEY=your_private_key_here
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
export ETHERSCAN_API_KEY=your_etherscan_api_key

# 部署到 Sepolia 测试网
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url sepolia \
    --broadcast \
    --verify \
    -vvvv

echo "Deployment completed!"
```

## 🧪 测试合约

创建测试文件 `contracts/test/NFTMarketplace.t.sol`：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";

contract NFTMarketplaceTest is Test {
    NFTMarketplace marketplace;
    // 需要部署一个测试 NFT 合约...

    function setUp() public {
        // 部署测试合约
        // marketplace = new NFTMarketplace(address(nftContract));
    }

    function testListNFT() public {
        // 测试上架功能
    }

    function testBuyNFT() public {
        // 测试购买功能
    }
}
```

运行测试：

```bash
forge test
forge test -vvv  # 详细输出
```

## 🌐 部署到 Sepolia

### 1. 配置环境变量

创建 `contracts/.env`：

```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. 获取测试 ETH

访问 Sepolia 水龙头：
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

### 3. 部署合约

```bash
cd contracts

# 编译合约
forge build

# 部署（使用脚本）
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url sepolia \
    --broadcast \
    --verify \
    -vvvv

# 或者直接部署单个合约
forge create src/NFTMarketplace.sol:NFTMarketplace \
    --rpc-url sepolia \
    --constructor-args 0xNFT_CONTRACT_ADDRESS \
    --private-key $PRIVATE_KEY \
    --verify
```

### 4. 获取部署地址

部署完成后，记录合约地址：
- Marketplace: `0x...`
- Staking: `0x...`
- Loan: `0x...`

## ✅ 验证合约

### 使用 Foundry 自动验证

```bash
forge verify-contract \
    --chain sepolia \
    --num-of-optimizations 200 \
    --watch \
    --constructor-args $(cast abi-encode "constructor(address)" 0xNFT_CONTRACT) \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    CONTRACT_ADDRESS \
    src/NFTMarketplace.sol:NFTMarketplace
```

### 使用 Etherscan 手动验证

1. 访问 [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. 搜索合约地址
3. 点击 "Verify and Publish"
4. 上传源码或使用 Solidity 标准 JSON 输入

## 🔧 配置前端

部署完成后，更新前端的 `.env` 文件：

```env
# NFT 合约地址
VITE_NFT_MARKETPLACE_ADDRESS=0xYourMarketplaceAddress
VITE_NFT_STAKING_ADDRESS=0xYourStakingAddress
VITE_NFT_LOAN_ADDRESS=0xYourLoanAddress
```

## 📚 常见问题

### 1. 编译错误

```bash
# 清理并重新编译
forge clean
forge build
```

### 2. Gas 估算失败

- 检查 RPC 端点是否可用
- 确认账户余额充足
- 尝试降低 Gas 价格

### 3. 验证失败

- 确保编译器版本匹配
- 检查优化设置
- 确认构造函数参数正确

## 🔗 相关资源

- [Foundry 文档](https://book.getfoundry.sh/)
- [OpenZeppelin 合约](https://docs.openzeppelin.com/contracts/)
- [Sepolia 测试网](https://sepolia.dev/)
- [Etherscan API](https://docs.etherscan.io/)

## 📝 下一步

1. ✅ 部署合约到测试网
2. ✅ 验证合约
3. ✅ 更新前端配置
4. ✅ 测试所有功能
5. ✅ 准备主网部署（可选）

祝您部署顺利！🎉

