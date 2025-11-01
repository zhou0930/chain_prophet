// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
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
    uint256 public listingFee = 25; // 2.5% 手续费 (25/1000)
    uint256 public platformFee = 10; // 1% 平台费 (10/1000)

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
        // 注意：这需要用户先调用 approve 授权市场合约才能转移
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

