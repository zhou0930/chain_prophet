// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
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

